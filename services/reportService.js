// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const AWS = require("aws-sdk");
// const { parse } = require("json2csv");
// require("dotenv").config();

// // Initialize AWS SDK
// AWS.config.update({
//   region: process.env.AWS_REGION || "ap-south-1",
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });
// const athena = new AWS.Athena();

// const app = express();
// const port = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // API Route for Reports
// app.post("/api/reports", async (req, res) => {
//   const { reportType, branchName, appStatus, startDate, endDate, clusterName, areaName, region, branchId } = req.body;
//   console.log("Received request body:", req.body);

//   try {
//     switch (reportType) {
//       case "Loan Application Report":
//         if (!branchName || !appStatus || !startDate || !endDate) {
//           return res.status(400).json({ errors: "Missing required fields." });
//         }
//         return await generateLoanApplicationReport(branchName, appStatus, startDate, endDate, res);

//       case "Borrower Master Report":
//         if (!branchName || !clusterName) {
//           return res.status(400).json({ errors: "Missing required fields." });
//         }
//         return await generateBorrowerMasterReport(branchName, clusterName, res);

//       case "Credit Report":
//         if (!branchId || !appStatus || !startDate || !endDate) {
//           return res.status(400).json({ errors: "Missing required fields." });
//         }
//         return await generateCreditReport(branchId, appStatus, startDate, endDate, res);

//       case "Fore Closure Report":
//         if (!branchId || !region) {
//           return res.status(400).json({ errors: "Missing required fields." });
//         }
//         return await generateForeClosureReport(branchId, region, res);

//       case "Employee Master Report":
//         if (!branchName || !areaName || !region || !clusterName) {
//           return res.status(400).json({ errors: "Missing required fields." });
//         }
//         return await generateEmployeeMasterReport(branchName, areaName, region, clusterName, res);

//       case "Death Report":
//         if (!branchName || !clusterName || !region) {
//           return res.status(400).json({ errors: "Missing required fields." });
//         }
//         return await generateDeathReport(branchName, clusterName, region, res);

//       default:
//         return res.status(400).json({ errors: "Invalid report type." });
//     }
//   } catch (error) {
//     console.error(`Error generating ${reportType}:`, error);
//     res.status(500).json({ errors: error.message });
//   }
// });

// // Query Execution Function
// const executeAthenaQuery = async (query) => {
//   const params = {
//     QueryString: query,
//     QueryExecutionContext: { Database: "srifincredit_views" },
//     ResultConfiguration: { OutputLocation: "s3://sfin-reporting-layer-logs/MIS_Query_Logs" },
//   };

//   try {
//     const { QueryExecutionId } = await athena.startQueryExecution(params).promise();
//     let queryStatus;
//     do {
//       const result = await athena.getQueryExecution({ QueryExecutionId }).promise();
//       queryStatus = result.QueryExecution.Status.State;
//       if (queryStatus === "FAILED" || queryStatus === "CANCELLED") {
//         throw new Error(result.QueryExecution.Status.StateChangeReason);
//       }
//       await new Promise((resolve) => setTimeout(resolve, 3000));
//     } while (queryStatus === "RUNNING" || queryStatus === "QUEUED");

//     const results = await athena.getQueryResults({ QueryExecutionId }).promise();
//     const columnNames = results.ResultSet.ResultSetMetadata.ColumnInfo.map((col) => col.Name);
//     return results.ResultSet.Rows.slice(1).map((row) =>
//       Object.fromEntries(columnNames.map((col, index) => [col, row.Data[index]?.VarCharValue || ""]))
//     );
//   } catch (error) {
//     console.error("Error executing Athena query:", error);
//     throw new Error(error.message);
//   }
// };

// // Report Generation Functions
// const generateReport = async (query, filename, res) => {
//   console.log("Executing Query:", query);
//   const results = await executeAthenaQuery(query);
//   if (!results.length) return res.status(404).json({ error: "No data found." });
//   res.header("Content-Type", "text/csv");
//   res.header("Content-Disposition", `attachment; filename=${filename}`);
//   res.send(parse(results));
// };

// const generateLoanApplicationReport = (branch, appStatus, startDate, endDate, res) =>
//   generateReport(
//     `SELECT * FROM vw_loan_applications_standardised 
//      WHERE ( "Branch name" = '${branch}' OR "Branch_ID" = '${branch}' )
//      AND App_Status = '${appStatus}' 
//      AND CAST(app_date AS DATE) BETWEEN DATE '${startDate}' AND DATE '${endDate}'`,
//     "loan_application_report.csv",
//     res
//   );


// const generateBorrowerMasterReport = (branchName, clusterName, res) =>
//   generateReport(
//     `SELECT * FROM srifin_customer_master WHERE "branch name" = '${branchName}' AND "cluster name" = '${clusterName}'`,
//     "borrower_master_report.csv",
//     res
//   );

// const generateCreditReport = (branchId, appStatus, startDate, endDate, res) =>
//   generateReport(
//     `SELECT * FROM vw_process_credit_report WHERE "BranchID_Name" = '${branchId}' AND "Credit_App_Status" = '${appStatus}' AND CAST(app_date AS DATE) BETWEEN DATE '${startDate}' AND DATE '${endDate}'`,
//     "credit_report.csv",
//     res
//   );

// const generateForeClosureReport = (branchId, region, res) =>
//   generateReport(
//     `SELECT * FROM vw_preclosure_report WHERE "Branch_ID" = '${branchId}' AND "Region" = '${region}'`,
//     "fore_closure_report.csv",
//     res
//   );

// const generateEmployeeMasterReport = (branchName, areaName, region, clusterName, res) =>
//   generateReport(
//     `SELECT * FROM vw_srifin_employee_master_report WHERE "BranchID_Name" = '${branchName}' AND "AreaID_Name" = '${areaName}' AND "RegionID_Name" = '${region}' AND "ClusterID_Name" = '${clusterName}'`,
//     "employee_master_report.csv",
//     res
//   );

// const generateDeathReport = (branchName, clusterName, region, res) =>
//   generateReport(
//     `SELECT * FROM vw_own_death_report WHERE "Branch" = '${branchName}' AND "Cluster" = '${clusterName}' AND "Region" = '${region}'`,
//     "death_report.csv",
//     res
//   );

// // Start Server
// app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
const AWS = require("aws-sdk");
const { createCSVFile } = require("../utils/fileutils");
const { executeAthenaQuery } = require("../utils/athenaUtils");

AWS.config.update({
  region: process.env.AWS_REGION || "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Format SQL values safely
const formatValue = (value) => (value ? `'${value.replace(/'/g, "''")}'` : "NULL");

const generateReportData = async (query) => {
  try {
    const results = await executeAthenaQuery(query);
    if (!results || results.length === 0) return null;
    return results;
  } catch (error) {
    console.error("Athena Query Execution Error:", error);
    return null;
  }
};

const createReportFile = async (reportData, filename) => {
  if (!reportData || reportData.length === 0) return null;
  try {
    return await createCSVFile(reportData, filename);
  } catch (error) {
    console.error("CSV File Creation Error:", error);
    return null;
  }
};
const handleReportRequest = async (query, filename, res, responseType) => {
  try {
    console.log("Executing Query:", query);

    const data = await generateReportData(query);
    if (!data || data.length === 0) {
      console.warn("No data returned from Athena.");
      return res.status(200).json({ success: false, message: "No report available" });
    }

    if (responseType === "json") {
      return res.json({ success: true, data });
    }

    const filePath = await createReportFile(data, filename);
    if (!filePath) {
      return res.status(500).json({ success: false, message: "Failed to generate report file" });
    }

    console.log("Report file generated:", filePath);
    return res.download(filePath);
  } catch (error) {
    console.error("Report generation error:", error);
    return res.status(500).json({ success: false, message: "Report generation failed" });
  }
};

// Report functions
const generateLoanApplicationReport = async (branch, appStatus, startDate, endDate, res, responseType = "csv") => {
  let query = `SELECT * FROM srifin_loan_applications_standardised WHERE 1=1`;

  if (branch) {
    query += ` AND "Branch" = ${formatValue(branch)}`;
  }
  if (appStatus) {
    query += ` AND "AppStatus" = ${formatValue(appStatus)}`;
  }
  if (startDate && endDate) {
    query += ` AND CAST("application_date" AS DATE) BETWEEN DATE ${formatValue(startDate)} AND DATE ${formatValue(endDate)}`;
  }

  return handleReportRequest(query, "LoanApplicationReport", res, responseType);
};

const generateBorrowerMasterReport = async (branch, cluster, res, responseType = "csv") => {
  let query = `SELECT * FROM srifin_customer_master WHERE 1=1`;

  if (branch) {
    query += ` AND "Branch" = ${formatValue(branch)}`;
  }
  if (cluster) {
    query += ` AND "Cluster" = ${formatValue(cluster)}`;
  }

  return handleReportRequest(query, "BorrowerMasterReport", res, responseType);
};

const generateCreditReport = async (branch, creditAppStatus, startDate, endDate, res, responseType = "csv") => {
  let query = `SELECT * FROM vw_process_credit_report WHERE 1=1`;

  if (branch) {
    query += ` AND "Branch" = ${formatValue(branch)}`;
  }
  if (creditAppStatus) {
    query += ` AND "CreditAppStatus" = ${formatValue(creditAppStatus)}`;
  }
  if (startDate && endDate) {
    query += ` AND CAST("application_date" AS DATE) BETWEEN DATE ${formatValue(startDate)} AND DATE ${formatValue(endDate)}`;
  }

  return handleReportRequest(query, "CreditReport", res, responseType);
};

const generateForeClosureReport = async (branch, region, res, responseType = "csv") => {
  let query = `SELECT * FROM vw_preclosure_report WHERE 1=1`;

  if (branch) {
    query += ` AND "Branch_ID" = ${formatValue(branch)}`;
  }
  if (region) {
    query += ` AND "Region" = ${formatValue(region)}`;
  }

  return handleReportRequest(query, "ForeClosureReport", res, responseType);
};

const generateEmployeeMasterReport = async (branch, area, region, cluster, employeeStatus, res, responseType = "csv") => {
  // Start building the base query
  let query = `SELECT * FROM vw_srifin_employee_master_report WHERE 1=1`;

  // Dynamically add conditions based on provided parameters
  if (branch) {
    query += ` AND "BranchID_Name" = ${formatValue(branch)}`;
  }
  if (area) {
    query += ` AND "AreaID_Name" = ${formatValue(area)}`;
  }
  if (region) {
    query += ` AND "RegionID_Name" = ${formatValue(region)}`;
  }
  if (cluster) {
    query += ` AND "ClusterID_Name" = ${formatValue(cluster)}`;
  }
  if (employeeStatus) {
    query += ` AND "Employee_Status" = ${formatValue(employeeStatus)}`;
  }

  // Call the function to handle the report request with the constructed query
  return handleReportRequest(query, "EmployeeMasterReport", res, responseType);
};


const generateDeathReport = async (branch, cluster, region, startDate, endDate, res, responseType = "csv") => {
  let query = `SELECT * FROM vw_own_death_report WHERE 1=1`;

  if (branch) {
    query += ` AND "Branch" = ${formatValue(branch)}`;
  }
  if (cluster) {
    query += ` AND "Cluster" = ${formatValue(cluster)}`;
  }
  if (region) {
    query += ` AND "Region" = ${formatValue(region)}`;
  }
  if (startDate && endDate) {
    query += ` AND CAST("application_date" AS DATE) BETWEEN DATE ${formatValue(startDate)} AND DATE ${formatValue(endDate)}`;
  }

  return handleReportRequest(query, "DeathReport", res, responseType);
};
module.exports = {
  generateLoanApplicationReport,
  generateBorrowerMasterReport,
  generateCreditReport,
  generateForeClosureReport,
  generateEmployeeMasterReport,
  generateDeathReport,
};
