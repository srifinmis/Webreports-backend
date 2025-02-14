require('dotenv').config();  // Ensure dotenv is loaded at the top

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fastCsv = require('fast-csv');
const { AthenaClient } = require('@aws-sdk/client-athena');
const { fromEnv } = require('@aws-sdk/credential-provider-env');

// Initialize Athena client
const region = process.env.AWS_REGION || 'ap-south-1';
const athenaClient = new AthenaClient({
  region: region,  // Pass region as a string directly
  credentials: fromEnv(),  // Automatically loads credentials from environment variables
});

// Log Athena client region to confirm
console.log("Athena client region:", athenaClient.config.region);

const app = express();
const port = process.env.PORT || 5000; // Use port from .env or default to 5000

// Middleware to parse JSON request bodies
app.use(express.json()); // Replaces body-parser.json()
app.use(express.urlencoded({ extended: true })); // For form data if needed
app.use(cors());

// Get the reports directory path from the .env file
const reportsDir = path.join(__dirname, process.env.REPORTS_DIR_PATH || 'reports');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// Function to generate a CSV report based on form data and report type
const generateCSVReport = (form, reportType) => {
  return new Promise((resolve, reject) => {
    const fileName = `${reportType.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    const filePath = path.join(reportsDir, fileName);
    const csvStream = fastCsv.format({ headers: true });
    const writableStream = fs.createWriteStream(filePath);

    csvStream.pipe(writableStream);
    csvStream.write(form);  // Assuming `form` is an array of objects
    csvStream.end();

    writableStream.on('finish', () => resolve(fileName));
    writableStream.on('error', reject);
  });
};

// Function to validate form data based on the selected report type
const validateForm = (form, reportType) => {
  const errors = {};
  const reports = {
    'Credit Report': {
      fields: [
        { name: 'branchIdName', required: true },
        { name: 'creditAppStatus', required: true },
        { name: 'appDate', required: true },
      ],
    },
    'Fore Closure Report': {
      fields: [
        { name: 'branchId', required: true },
        { name: 'region', required: true },
      ],
    },
    'Borrower Master Report': {
      fields: [
        { name: 'branchName', required: true },
        { name: 'clusterName', required: true },
      ],
    },
    'Loan Application Report': {
      fields: [
        { name: 'branchName', required: true },
        { name: 'appStatus', required: true },
        { name: 'appDate', required: true },
      ],
    },
    'Employee Master Report': {
      fields: [
        { name: 'branchid_name', required: true },
        { name: 'areaid_name', required: true },
        { name: 'RegionID_Name', required: true },
        { name: 'ClusterID_Name', required: true },
      ],
    },
    'Death Report': {
      fields: [
        { name: 'cluster', required: true },
        { name: 'region', required: true },
        { name: 'branch', required: true },
      ],
    },
  };

  if (!reports[reportType]) {
    errors.reportType = 'Invalid report type';
    return errors;
  }

  reports[reportType].fields.forEach((field) => {
    if (field.required && !form[field.name]) {
      errors[field.name] = `${field.name} is required`;
    }
  });

  return errors;
};

// Route to generate the report
app.post('/api/reports', async (req, res) => {
  const form = req.body;
  console.log('Received form data:', form);
  const { reportType } = form;

  const errors = validateForm(form, reportType);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const fileName = await generateCSVReport(form, reportType);
    const downloadLink = `http://localhost:${port}/reports/${fileName}`;
    res.status(200).json({ message: 'Report generated successfully!', downloadLink });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error });
  }
});

// Serve reports directory as static files
app.use('/reports', express.static(reportsDir));

// Test route to check Athena connectivity
app.get('/api/test-athena', async (req, res) => {
  try {
    const queryExecutionParams = {
      QueryString: 'SELECT * FROM your_table LIMIT 10;',  // Replace with your Athena query
      QueryExecutionContext: {
        Database: 'your_database',  // Replace with your Athena database name
      },
      ResultConfiguration: {
        OutputLocation: 's3://your-s3-bucket/athena-output/',  // Replace with your S3 bucket location
      },
    };

    const { StartQueryExecutionCommand } = require('@aws-sdk/client-athena');
    const command = new StartQueryExecutionCommand(queryExecutionParams);
    const response = await athenaClient.send(command);

    res.status(200).json({
      message: 'Athena query started successfully',
      queryExecutionId: response.QueryExecutionId,
    });
  } catch (error) {
    console.error('Error starting Athena query:', error);
    res.status(500).json({ message: 'Error starting Athena query', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
