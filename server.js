const express = require("express");
const cors = require("cors");
require("dotenv").config();
const reportService = require("./services/reportService");
const { executeAthenaQuery } = require("./utils/athenaUtils");
const { queryAthena } = require("./utils/athena");
const dropdownRoutes = require("./routes/dropdowm");; // Fixed typo

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
app.use("/api/dropdowns", dropdownRoutes);

// Reports Route (GET)
app.get("/api/reports", async (req, res) => {
  console.log("Received GET report request:", req.query);

  const { reportType, branch, region, cluster, clusters, area, creditAppStatuses, app_status, branches, appStartDate, appEndDate } = req.query;

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
        return await reportService.generateEmployeeMasterReport(branch, area, region, cluster, req.query.employeeStatus, res);

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

app.post("/api/reports", async (req, res) => {
  console.log("Received POST report request:", req.body);

  const { reportType, branches, regions, clusters, areas, creditAppStatus, app_status, employeeStatuses, appStartDate, appEndDate } = req.body;

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

app.post("/generate-report", async (req, res) => {
  const { fromDate, toDate, reportType, cutoff_date } = req.body;

  if (!fromDate || !toDate || !reportType || !cutoff_date) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const updateQuery = `UPDATE srifincredit_views.srifin_loan_details_cutoffdate SET cutoff_date = DATE '${cutoff_date}'`;
    await queryAthena(updateQuery);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const selectQuery = `SELECT 
    "Segment Identifier",
      "Member Identifier",
      "Branch Identifier",
      "Kendra/Centre Identifier",
      "Group Identifier1",
      "Member Name 1",
      "Member Name 2",
      "Member Name 3",
      "Alternate Name of Member",
      "Member Birth Date",
      "Member Age",
      "Member's age as on date",
      "Member Gender Type",
      "Marital Status Type",
      "Key Person's name",
      "Key Person's relationship",
      "Member relationship Name 1",
      "Member relationship Type 1",
      "Member relationship Name 2",
      "Member relationship Type 2",
      "Member relationship Name 3",
      "Member relationship Type 3",
      "Member relationship Name 4",
      "Member relationship Type 4",
      "Nominee Name",
      "Nominee relationship",
      "Nominee Age",
      "Voter's ID",
      "UID",
      "PAN",
      "Ration Card",
      "Member Other ID 1 Type description",
      "Member Other ID 1",
      "Member Other ID 2 Type description",
      "Member Other ID 2",
      "Other ID 3 Type",
      "Other ID 3 Value",
      "Telephone Number 1 type Indicator",
      "Member Telephone Number 1",
      "Telephone Number 2 type Indicator",
      "Member Telephone Number 2",
      "Poverty Index",
      "Asset ownership indicator",
      "Number of Dependents",
      "Bank Account - Bank Name",
      "Bank Account - Branch Name",
      "Bank Account - Account Number",
      "Occupation",
      "Total Monthly Family Income",
      "Monthly Family Expenses",
      "Member's Religion",
      "Member's Caste",
      "Group Leader indicator",
      "Center Leader indicator",
      "Dummy1",
      "Segment Identifier2",
      "Member's Permanent Address",
      "State Code(Permanent Address)",
      "Pin Code(Permanent Address)",
      "Member's Current Address",
      "State Code (Current Address)",
      "Pin Code(Current Address)",
      "Dummy3",
      "Segment Identifier_ACT",
      "Unique Account Refernce number_ACT",
      "Account Number_ACT",
      "Branch Identifier_ACT",
      "Kendra/Centre Identifier2_ACT",
      "Loan Officer for Originating the loan_ACT",
      "Date of Account Information_ACT",
      "Loan Category_ACT",
      "Group Identifier_ACT",
      "Loan Cycle-id_ACT",
      "Loan Purpose_ACT",
      "Account Status_ACT",
      "Application date_ACT",
      "Sanctioned Date",
      "Date Opened/Disbursed_ACT",
      "Date Closed_ACT",
      "Date of last payment_ACT",
      "Applied For amount_ACT",
      "Loan amount Sanctioned_ACT",
      "Total Amount Disbursed(Rupees)_ACT",
      "Number of Installments_ACT",
      "Repayment Frequency_ACT",
      "Minimum Amt Due/Instalment Amount(EWI)_ACT",
      "Current Balance(Rupees)_ACT",
      "Amount Overdue(Rupees)_ACT",
      "DPD (Days past due)_ACT",
      "Write Off Amount(Rupees)_ACT",
      "Date Write-Off_ACT",
      "Write-off reason",
      "No.of meetings held_ACT",
      "No. of meetings missed_ACT",
      "Insurance Indicator_ACT",
      "Type of Insurance_ACT",
      "Sum Assured/Coverage_ACT",
      "Agreed meeting day of the week_ACT",
      "Agreed Meeting time of the day_ACT",
      "Dummy2_ACT",
	    "Dummy2_ACT"
     FROM srifincredit_views.vw_cic_base_data WHERE CAST(cycledate AS DATE) = DATE '${cutoff_date}' AND CAST(disb_date AS DATE) BETWEEN DATE '${fromDate}' AND DATE '${toDate}'`;

    const results = await queryAthena(selectQuery);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-reupload", async (req, res) => {
  const { csvData, reportType, cutoff_date } = req.body;

  if (!csvData || csvData.length === 0 || !cutoff_date || !reportType) {
    return res.status(400).json({ error: "Missing required parameters or empty CSV data" });
  }

  try {
    const updateQuery = `UPDATE srifincredit_views.srifin_loan_details_cutoffdate SET cutoff_date = DATE '${cutoff_date}'`;
    await queryAthena(updateQuery);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const formattedCsvData = csvData.slice(1).filter((val) => val.trim() !== "").join(",");
    const selectQuery = `SELECT 
     "Segment Identifier",
      "Member Identifier",
      "Branch Identifier",
      "Kendra/Centre Identifier",
      "Group Identifier1",
      "Member Name 1",
      "Member Name 2",
      "Member Name 3",
      "Alternate Name of Member",
      "Member Birth Date",
      "Member Age",
      "Member's age as on date",
      "Member Gender Type",
      "Marital Status Type",
      "Key Person's name",
      "Key Person's relationship",
      "Member relationship Name 1",
      "Member relationship Type 1",
      "Member relationship Name 2",
      "Member relationship Type 2",
      "Member relationship Name 3",
      "Member relationship Type 3",
      "Member relationship Name 4",
      "Member relationship Type 4",
      "Nominee Name",
      "Nominee relationship",
      "Nominee Age",
      "Voter's ID",
      "UID",
      "PAN",
      "Ration Card",
      "Member Other ID 1 Type description",
      "Member Other ID 1",
      "Member Other ID 2 Type description",
      "Member Other ID 2",
      "Other ID 3 Type",
      "Other ID 3 Value",
      "Telephone Number 1 type Indicator",
      "Member Telephone Number 1",
      "Telephone Number 2 type Indicator",
      "Member Telephone Number 2",
      "Poverty Index",
      "Asset ownership indicator",
      "Number of Dependents",
      "Bank Account - Bank Name",
      "Bank Account - Branch Name",
      "Bank Account - Account Number",
      "Occupation",
      "Total Monthly Family Income",
      "Monthly Family Expenses",
      "Member's Religion",
      "Member's Caste",
      "Group Leader indicator",
      "Center Leader indicator",
      "Dummy1",
      "Segment Identifier2",
      "Member's Permanent Address",
      "State Code(Permanent Address)",
      "Pin Code(Permanent Address)",
      "Member's Current Address",
      "State Code (Current Address)",
      "Pin Code(Current Address)",
      "Dummy3",
      "Segment Identifier_ACT",
      "Unique Account Refernce number_ACT",
      "Account Number_ACT",
      "Branch Identifier_ACT",
      "Kendra/Centre Identifier2_ACT",
      "Loan Officer for Originating the loan_ACT",
      "Date of Account Information_ACT",
      "Loan Category_ACT",
      "Group Identifier_ACT",
      "Loan Cycle-id_ACT",
      "Loan Purpose_ACT",
      "Account Status_ACT",
      "Application date_ACT",
      "Sanctioned Date",
      "Date Opened/Disbursed_ACT",
      "Date Closed_ACT",
      "Date of last payment_ACT",
      "Applied For amount_ACT",
      "Loan amount Sanctioned_ACT",
      "Total Amount Disbursed(Rupees)_ACT",
      "Number of Installments_ACT",
      "Repayment Frequency_ACT",
      "Minimum Amt Due/Instalment Amount(EWI)_ACT",
      "Current Balance(Rupees)_ACT",
      "Amount Overdue(Rupees)_ACT",
      "DPD (Days past due)_ACT",
      "Write Off Amount(Rupees)_ACT",
      "Date Write-Off_ACT",
      "Write-off reason",
      "No.of meetings held_ACT",
      "No. of meetings missed_ACT",
      "Insurance Indicator_ACT",
      "Type of Insurance_ACT",
      "Sum Assured/Coverage_ACT",
      "Agreed meeting day of the week_ACT",
      "Agreed Meeting time of the day_ACT",
      "Dummy2_ACT",
	    "Dummy2_ACT"
     FROM srifincredit_views.vw_cic_base_data WHERE CAST(cycledate AS DATE) = DATE '${cutoff_date}' AND loan_application_id IN (${formattedCsvData})`;

    const results = await queryAthena(selectQuery);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error generating reupload:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Report Header & Trailer
app.post("/get-report-header-trailer", async (req, res) => {
  const { reportType } = req.body;

  if (!reportType) {
    return res.status(400).json({ error: "Missing reportType parameter" });
  }

  try {
    const query = `SELECT header, trail FROM srifincredit_views.vw_srifin_cic_report_types WHERE report_type='${reportType}'`;
    const result = await queryAthena(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found for the given reportType" });
    }

    const { header = "", trail = "" } = result[0]; 
    res.json({ header, trail });
  } catch (error) {
    console.error("Error fetching report header & trailer:", error);
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
