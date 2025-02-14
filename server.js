// // server.js (Backend)

// const express = require('express');
// const bodyParser = require('body-parser');
// const reportService = require('./services/reportService'); // Import service functions
// const path = require('path');
// const fs = require('fs');
// const app = express();
// const port = process.env.PORT || 5000;

// app.use(bodyParser.json());

// // Ensure the 'downloads' folder exists
// const downloadDir = path.join(__dirname, 'downloads');
// if (!fs.existsSync(downloadDir)) {
//   fs.mkdirSync(downloadDir);
//   console.log("Created 'downloads' folder.");
// }

// // Handle report requests
// app.post('/api/reports', async (req, res) => {
//   const {
//     reportType,
//     branchId,
//     branch_name,
//     clusterName,
//     creditAppStatus,
//     region,
//     appStatus,
//     appDate,
//     areaIdName,
//     regionIdName,
//   } = req.body;

//   try {
//     let reportData;
//     let filePath;

//     // Handle each report type and generate the report
//     switch (reportType) {
//       case 'Fore Closure Report':
//         reportData = await reportService.generateForeClosureReport(branchId, region);
//         break;
//       case 'Borrower Master Report':
//         reportData = await reportService.generateBorrowerMasterReport(branch_name, clusterName);
//         break;
//       case 'Credit Report':
//         reportData = await reportService.generateCreditReport(creditAppStatus, region);
//         break;
//       case 'Loan Application Report':
//         reportData = await reportService.generateLoanApplicationReport(appStatus, appDate, branch_name);
//         break;
//       case 'Employee Master Report':
//         reportData = await reportService.generateEmployeeMasterReport(branchId, areaIdName, regionIdName);
//         break;
//       case 'Death Report':
//         reportData = await reportService.generateDeathReportWithColumns(branchId, clusterName, region);
//         break;
//       default:
//         return res.status(400).json({ errors: 'Invalid report type.' });
//     }

//     // Generate the report file
//     filePath = await reportService.createReportFile(reportData, reportType.replace(/ /g, '_').toLowerCase());

//     console.log("File path for download:", filePath);  // Log the file path to ensure it's correct

//     // Ensure the file exists before attempting to download
//     if (fs.existsSync(filePath)) {
//       // Send the file as a download
//       res.status(200).download(filePath, (err) => {
//         if (err) {
//           console.error("Error downloading the file:", err);
//           res.status(500).json({ errors: 'Error while downloading the report.' });
//         }
//         // Optional: delete the file after download (cleaning up)
//         fs.unlinkSync(filePath);
//       });
//     } else {
//       console.error("File not found:", filePath);
//       res.status(500).json({ errors: 'File not found.' });
//     }
//   } catch (error) {
//     console.error("Error generating report:", error);
//     res.status(500).json({ errors: error.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const reportService = require("./services/reportService");
const { executeAthenaQuery } = require("./utils/athenaUtils");
const dropdownRoutes = require("./routes/dropdowm"); // Ensure this exists and is a router

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Debugging: Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Use dropdown routes
app.use("/api/dropdowns", dropdownRoutes); // Ensure dropdownRoutes is a valid router

// Reports Route (GET)
app.get("/api/reports", async (req, res) => {
  console.log("Received report request:", req.query);

  const {
    reportType,
    branch,
    region,
    cluster,
    area,
    creditAppStatus,
    appStatus,
    employeeStatus,
    appStartDate,
    appEndDate,
  } = req.query;

  try {
    switch (reportType) {
      case "Loan Application Report":
        return await reportService.generateLoanApplicationReport(branch, appStatus, res);

      case "Borrower Master Report":
        return await reportService.generateBorrowerMasterReport(branch, cluster, res);

      case "Credit Report":
        return await reportService.generateCreditReport(branch, creditAppStatus, res);

      case "Fore Closure Report":
        return await reportService.generateForeClosureReport(branch, region, res);

      case "Employee Master Report":
        return await reportService.generateEmployeeMasterReport(branch, area, region, cluster, employeeStatus, res);

      case "Death Report":
        return await reportService.generateDeathReport(branch, cluster, region, res);

      default:
        return res.status(400).json({ error: "Invalid report type." });
    }
  } catch (error) {
    console.error(`Error generating ${reportType}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Reports Route (POST)
app.post("/api/reports", async (req, res) => {
  console.log("Received report request:", req.body);

  const {
    reportType,
    branch,
    region,
    cluster,
    area,
    creditAppStatus,
    appStatus,
    employeeStatus,
    appStartDate,
    appEndDate,
  } = req.body;

  try {
    switch (reportType) {
      case "Loan Application Report":
        return await reportService.generateLoanApplicationReport(branch, appStatus, appStartDate, appEndDate, res);

      case "Borrower Master Report":
        return await reportService.generateBorrowerMasterReport(branch, cluster, res);

      case "Credit Report":
        return await reportService.generateCreditReport(branch, creditAppStatus, appStartDate, appEndDate, res);

      case "Fore Closure Report":
        return await reportService.generateForeClosureReport(branch, region, res);

      case "Employee Master Report":
        return await reportService.generateEmployeeMasterReport(branch, area, region, cluster, employeeStatus, res);

      case "Death Report":
        return await reportService.generateDeathReport(branch, cluster, region, appStartDate, appEndDate, res);

      default:
        return res.status(400).json({ error: "Invalid report type." });
    }
  } catch (error) {
    console.error(`Error generating ${reportType}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route for debugging
app.use((req, res) => {
  console.log(`Unhandled request: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

// Start Server
app.listen(port, () => console.log(`✅ Server running at: http://localhost:${port}`));
