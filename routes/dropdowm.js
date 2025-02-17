const express = require("express");
const { executeAthenaQuery } = require("../utils/athenaUtils");

const router = express.Router();

// GET dropdown values based on type and reportType
router.get("/:dropdownType", async (req, res) => {
  const { dropdownType } = req.params;
  const { reportType } = req.query;

  if (!reportType) {
    return res.status(400).json({ error: "reportType is required" });
  }

  let query;
  let columnName; // Define the column to extract values from

  switch (dropdownType) {
    case "clusters":
      switch (reportType) {
        case "Fore Closure Report":
          query = "SELECT DISTINCT Region AS Cluster FROM vw_preclosure_report";
          columnName = "Cluster";
          break;
        case "Borrower Master Report":
          query = "SELECT DISTINCT cluster name FROM srifincredit_views.srifin_customer_master";
          columnName = "cluster name";
          break;
        case "Credit Report":
          query = "SELECT DISTINCT ClusterID_name FROM vw_process_credit_report";
          columnName = "ClusterID_name";
          break;
        case "Loan Application Report":
          query = "SELECT DISTINCT Branch AS Cluster FROM srifin_loan_applications_standardised";
          columnName = "Cluster";
          break;
        case "Employee Master Report":
          query = "SELECT DISTINCT ClusterID_Name AS Cluster FROM vw_srifin_employee_master_report";
          columnName = "Cluster";
          break;
        case "Death Report":
          query = "SELECT DISTINCT Cluster FROM vw_own_death_report";
          columnName = "Cluster";
          break;
        default:
          return res.status(400).json({ error: "Invalid report type for clusters." });
      }
      break;

    case "branches":
      query = "SELECT DISTINCT Branch_ID FROM vw_preclosure_report"; 
      columnName = "Branch_ID";
      break;

    case "regions":
      query = "SELECT DISTINCT Region FROM vw_preclosure_report"; 
      columnName = "Region";
      break;

    case "areas":
      query = "SELECT DISTINCT AreaID_Name FROM vw_srifin_employee_master_report"; 
      columnName = "AreaID_Name";
      break;

    case "creditAppStatuses":
      query = "SELECT DISTINCT Credit_App_Status FROM vw_process_credit_report";
      columnName = "Credit_App_Status";
      break;

    case "appStatuses":
      query = "SELECT DISTINCT app_status FROM srifin_loan_applications_standardised";
      columnName = "app_status";
      break;

    case "employeeStatuses":
      query = "SELECT DISTINCT Employee_Status FROM vw_srifin_employee_master_report";
      columnName = "Employee_Status";
      break;

    default:
      return res.status(400).json({ error: "Invalid dropdown type." });
  }

  try {
    const results = await executeAthenaQuery(query);

    // Extract only the values from the specified column and return as a list
    const listResponse = results.map(row => row[columnName]);

    res.json(listResponse);
  } catch (error) {
    console.error("Athena Query Error:", error);
    res.status(500).json({ error: "Failed to fetch dropdown data" });
  }
});

module.exports = router;
