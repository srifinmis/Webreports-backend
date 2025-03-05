const express = require("express");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Import Routes
const foreclosureRoutes = require("./routes/foreclosure");
const borrowerMasterRoutes = require("./routes/BorrowerMasterReport");
const creditReportRoutes = require("./routes/CreditReport");
const dropdownRoutes = require("./routes/LoanApplicationReport");
const employeeMasterRoutes = require("./routes/EmployeeMasterReport");
const deathReportRoutes = require("./routes/DeathReport");

// Import Service Functions
const { generateForeClosureReport, generateBorrowerMasterReport,generateCreditReport,generateLoanApplicationReport, generateEmployeeMasterReport,generateDeathReport } = require("./services/reportService");

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Swagger Documentation
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Report API",
      version: "1.0.0",
      description: "API documentation for Report Services",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/foreclosure", foreclosureRoutes);
app.use("/api/borrowermaster", borrowerMasterRoutes);
app.use("/api/creditreport", creditReportRoutes);
app.use("/api", dropdownRoutes);
app.use("/api/employeemaster", employeeMasterRoutes);
app.use("/api/deathreport", deathReportRoutes);

// POST Route for Foreclosure Report
app.post("/api/foreclosure/generate", async (req, res) => {
  try {
    let { branchName, regionName } = req.body;

    branchName = branchName || null;
    regionName = regionName || null;

    const reportData = await generateForeClosureReport(branchName, regionName);

    if (!Array.isArray(reportData)) {
      console.error("Unexpected response format:", reportData);
      return res.status(500).json({ error: "Invalid response format" });
    }

    if (reportData.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    return res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("❌ Error generating foreclosure report:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/borrowermaster/generate", async (req, res) => {
  try {
    console.log("🔍 Received Request Body:", req.body);

    let { branchName } = req.body;

    // Extract the string from the object if received incorrectly
    if (branchName && typeof branchName === "object") {
      console.warn("⚠️ branchName received as an object! Extracting BranchName...");
      branchName = branchName.BranchName || null; // Extract string value
    }

    if (branchName && typeof branchName !== "string") {
      console.error("❌ ERROR: branchName should be a string, received:", typeof branchName, branchName);
      return res.status(400).json({ error: "Invalid branchName format" });
    }

    const reportData = await generateBorrowerMasterReport(branchName);

    console.log("✅ Final Report Data:", reportData, "| Type:", typeof reportData);

    if (!Array.isArray(reportData)) {
      console.error("❌ ERROR: Unexpected response format from generateBorrowerMasterReport()");
      return res.status(500).json({ error: "Invalid response format" });
    }

    if (reportData.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    return res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("❌ Error generating Borrower Master Report:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/api/creditreport/generate-report", async (req, res) => {
  try {
    console.log("🔍 Received Request Body:", req.body);

    const { branchID, creditAppStatus, startDate, endDate } = req.body;

    if (!branchID || !startDate || !endDate) {
      console.error("❌ ERROR: Missing required fields");
      return res.status(400).json({ error: "Branch ID, Start Date, and End Date are required" });
    }

    const reportData = await generateCreditReport(branchID, creditAppStatus, startDate, endDate);

    if (!Array.isArray(reportData)) {
      console.error("❌ ERROR: Unexpected response format from generateCreditReport()");
      return res.status(500).json({ error: "Invalid response format" });
    }

    if (reportData.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    return res.json({ success: true, data: Array.isArray(reportData) ? reportData : [] });
  } catch (error) {
    console.error("❌ Error generating Credit Report:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/generate-loanapplication-report', async (req, res) => {
  try {
    console.log("🔍 Received Request Body:", req.body);

    const { branchName, appStatus, startDate, endDate } = req.body;

    if (!branchName || !startDate || !endDate) {
      console.error("❌ ERROR: Missing required fields");
      return res.status(400).json({ error: "Branch Name, Start Date, and End Date are required" });
    }

    const appDate = { start: startDate, end: endDate };
    const reportData = await generateLoanApplicationReport(branchName, appStatus, appDate);

    // Ensure reportData is an array
    if (!Array.isArray(reportData)) {
      console.error("❌ ERROR: Unexpected response format from generateLoanApplicationReport()");
      return res.status(500).json({ error: "Invalid response format" });
    }

    if (reportData.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    return res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("❌ Error generating Loan Application Report:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST Route for Employee Master Report
app.post("/api/employeemaster/generate", async (req, res) => {
  try {
    console.log("🔍 Received Request Body:", req.body);

    let { branchID, areaID, regionID, clusterID } = req.body;

    // Validate required fields
    if (!branchID) {
      console.error("❌ ERROR: Missing required field: branchID");
      return res.status(400).json({ error: "Branch ID is required" });
    }

    // Ensure employeeStatus is an array
    

    // Build the filter object dynamically based on parameters
    const filters = { branchID, areaID, regionID, clusterID  };

    // Call the service function to generate the report
    const reportData = await generateEmployeeMasterReport(filters);

    // Check if the reportData is in the correct format
    if (!Array.isArray(reportData)) {
      console.error("❌ ERROR: Unexpected response format from generateEmployeeMasterReport()");
      return res.status(500).json({ error: "Invalid response format" });
    }

    // If the result is empty, return a 404 response
    if (reportData.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Return the report data
    return res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("❌ Error generating Employee Master Report:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// POST Route for Death Report
// POST Route for Death Report
app.post("/api/deathreport/generate", async (req, res) => {
  try {
    console.log("🔍 Received Request Body:", req.body);

    let { Cluster, Region, Branch } = req.body;

    // Validate required fields (if necessary, you can allow some to be optional)
    if (!Cluster && !Region && !Branch) {
      console.error("❌ ERROR: At least one of Cluster, Region, or Branch is required");
      return res.status(400).json({ error: "Cluster, Region, or Branch is required" });
    }

    // Call the service function to generate the report
    const reportData = await generateDeathReport({ Cluster, Region, Branch });

    // Check if the reportData is in the correct format
    if (!Array.isArray(reportData)) {
      console.error("❌ ERROR: Unexpected response format from generateDeathReport()");
      return res.status(500).json({ error: "Invalid response format" });
    }

    // If the result is empty, return a 404 response
    if (reportData.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Return the report data
    return res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("❌ Error generating Death Report:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
