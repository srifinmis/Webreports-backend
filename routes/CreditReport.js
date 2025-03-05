const express = require("express");
const router = express.Router();
const { executeAthenaQuery } = require("../utils/athenaUtils");

// Test route to verify API is running
router.get("/dropdown-data-creditreport", async (req, res) => {
    try {
      const queries = {
        statuses: `SELECT DISTINCT "Credit_App_Status" AS column1 FROM srifincredit_views.vw_process_credit_report WHERE "Credit_App_Status" IS NOT NULL`,
        branches: `SELECT DISTINCT "BranchID_Name" AS column1 FROM srifincredit_views.vw_process_credit_report WHERE "BranchID_Name" IS NOT NULL`
      };
  
      const dropdownData = {};
  
      for (const [key, query] of Object.entries(queries)) {
        try {
          const result = await executeAthenaQuery(query);
          
          // Debugging: Log raw Athena query output
          console.log(`Raw Athena query result for ${key}:`, result);
  
          // Process result: Extract column1 values and remove "value" row
          dropdownData[key] = result
            .map(item => item.column1)
            .filter(value => value && value.trim().toLowerCase() !== "value"); // Remove unwanted "value"
  
        } catch (error) {
          console.error(`Error fetching ${key}:`, error);
          dropdownData[key] = [];
        }
      }
  
      res.json(dropdownData);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
