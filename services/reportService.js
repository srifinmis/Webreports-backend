// const AWS = require("aws-sdk");
// const { createCSVFile } = require("../utils/fileutils");
// const { executeAthenaQuery } = require("../utils/athenaUtils");
// const { AthenaClient, StartQueryExecutionCommand, GetQueryResultsCommand } = require("@aws-sdk/client-athena");

// AWS.config.update({
//   region: process.env.AWS_REGION || "ap-south-1",
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// // Format SQL values safely
// const formatValue = (value) => (value ? `'${value.replace(/'/g, "''")}'` : "NULL");

// const generateReportData = async (query) => {
//   try {
//     const results = await executeAthenaQuery(query);
//     if (!results || results.length === 0) return null;
//     return results;
//   } catch (error) {
//     console.error("Athena Query Execution Error:", error);
//     return null;
//   }
// };

// const createReportFile = async (reportData, filename) => {
//   if (!reportData || reportData.length === 0) return null;
//   try {
//     return await createCSVFile(reportData, filename);
//   } catch (error) {
//     console.error("CSV File Creation Error:", error);
//     return null;
//   }
// };
// const handleReportRequest = async (query, filename, res, responseType) => {
//   try {
//     console.log("Executing Query:", query);

//     const data = await generateReportData(query);
//     if (!data || data.length === 0) {
//       console.warn("No data returned from Athena.");
//       return res.status(200).json({ success: false, message: "No report available" });
//     }

//     if (responseType === "json") {
//       return res.json({ success: true, data });
//     }

//     const filePath = await createReportFile(data, filename);
//     if (!filePath) {
//       return res.status(500).json({ success: false, message: "Failed to generate report file" });
//     }

//     console.log("Report file generated:", filePath);
//     return res.download(filePath);
//   } catch (error) {
//     console.error("Report generation error:", error);
//     return res.status(500).json({ success: false, message: "Report generation failed" });
//   }
// };

// // Report functions
// const generateLoanApplicationReport = async (branches, appStatus, startDate, endDate, res, responseType = "csv") => {
//   let query = `SELECT * FROM srifin_loan_applications_standardised WHERE 1=1`;

//   if (branches) {
//     query += ` AND "branch name" = ${formatValue(branches)}`;
//   }
//   if (appStatus) {
//     query += ` AND "app_status" = ${formatValue(appStatus)}`;
//   }
//   if (startDate && endDate) {
//     query += ` AND CAST("app_date" AS DATE) BETWEEN DATE ${formatValue(startDate)} AND DATE ${formatValue(endDate)}`;
//   }

//   return handleReportRequest(query, "LoanApplicationReport", res, responseType);
// };

// const generateBorrowerMasterReport = async (branches, clusters, res, responseType = "csv") => {
//   let query = `SELECT * FROM srifin_customer_master WHERE 1=1`;

//   if (branches) {
//     query += ` AND "branch name" = ${formatValue(branches)}`;
//   }
//   if (clusters) {
//     query += ` AND "cluster name" = ${formatValue(clusters)}`;
//   }

//   return handleReportRequest(query, "BorrowerMasterReport", res, responseType);
// };

// const generateCreditReport = async (branches, creditAppStatus, startDate, endDate, res, responseType = "csv") => {
//   let query = `SELECT * FROM vw_process_credit_report WHERE 1=1`;

//   if (branches) {
//     query += ` AND "BranchID_Name" = ${formatValue(branches)}`;
//   }
//   if (creditAppStatus) {
//     query += ` AND "Credit_App_Status" = ${formatValue(creditAppStatus)}`;
//   }
//   if (startDate && endDate) {
//     query += ` AND CAST("app_date" AS DATE) BETWEEN DATE ${formatValue(startDate)} AND DATE ${formatValue(endDate)}`;
//   }

//   return handleReportRequest(query, "CreditReport", res, responseType);
// };

// const generateForeClosureReport = async (branches, regions, res, responseType = "csv") => {
//   const query = `
//     SELECT * FROM vw_preclosure_report
//     WHERE "Branch_ID" = ${formatValue(branches)}
//     AND "region" = ${formatValue(regions)}
//   `;
//   return handleReportRequest(query, "ForeClosureReport", res, responseType);
// };

// const generateEmployeeMasterReport = async (branches, areas, regions, clusters, employeeStatuses, res, responseType = "csv") => {
//   // Start building the base query
//   let query = `SELECT * FROM vw_srifin_employee_master_report WHERE 1=1`;

//   // Dynamically add conditions based on provided parameters
//   if (branches) {
//     query += ` AND "BranchID_Name" = ${formatValue(branches)}`;
//   }
//   if (areas) {
//     query += ` AND "AreaID_Name" = ${formatValue(areas)}`;
//   }
//   if (regions) {
//     query += ` AND "RegionID_Name" = ${formatValue(regions)}`;
//   }
//   if (clusters) {
//     query += ` AND "ClusterID_Name" = ${formatValue(clusters)}`;
//   }
//   if (employeeStatuses) {
//     query += ` AND "Employee_Status" = ${formatValue(employeeStatuses)}`;
//   }

//   // Call the function to handle the report request with the constructed query
//   return handleReportRequest(query, "EmployeeMasterReport", res, responseType);
// };



// const generateDeathReport = async (branches, clusters, regions, res, responseType = "csv") => {
//   const query = `
//     SELECT * FROM vw_own_death_report
//     WHERE "Branch" = ${formatValue(branches)}
//     AND "Cluster" = ${formatValue(clusters)}
//     AND "Region" = ${formatValue(regions)}
//   `;
//   return handleReportRequest(query, "DeathReport", res, responseType);
// };
// module.exports = {
//   generateLoanApplicationReport,
//   generateBorrowerMasterReport,
//   generateCreditReport,
//   generateForeClosureReport,
//   generateEmployeeMasterReport,
//   generateDeathReport,
// };