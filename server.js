
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
    clusters,
    area,
    creditAppStatuses,
    appStatus,
    employeeStatus,
    app_status,
    branches,
    appStartDate,
    appEndDate,
  } = req.query;

  try {
    switch (reportType) {
      case "Loan Application Report":
        return await reportService.generateLoanApplicationReport(branches, app_status, res);

      case "Borrower Master Report":
        return await reportService.generateBorrowerMasterReport(branch, clusters, res);

      case "Credit Report":
        return await reportService.generateCreditReport(branch, creditAppStatuses, res);

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
    branches,
    regions,
    clusters,
    areas,
    creditAppStatus,
    appStatus,
    employeeStatuses,
    app_status,
    appStartDate,
    appEndDate,
  } = req.body;

  try {
    switch (reportType) {
      case "Loan Application Report":
        return await reportService.generateLoanApplicationReport(branches, app_status, appStartDate, appEndDate, res);

      case "Borrower Master Report":
        return await reportService.generateBorrowerMasterReport(branches, clusters, res);

      case "Credit Report":
        return await reportService.generateCreditReport(branches, creditAppStatus, appStartDate, appEndDate, res);

      case "Fore Closure Report":
        return await reportService.generateForeClosureReport(branches, regions, res);

      case "Employee Master Report":
        return await reportService.generateEmployeeMasterReport(branches, areas, regions, clusters, employeeStatuses, res);

      case "Death Report":
        return await reportService.generateDeathReport(branches, clusters, regions, res);

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
