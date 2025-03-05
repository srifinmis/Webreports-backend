const express = require("express");
const router = express.Router();
const { executeAthenaQuery } = require("../utils/athenaUtils");

router.get("/dropdown-data-loanapplication", async (req, res) => {
  try {
    const queries = {
      branches: `SELECT DISTINCT "branch name" FROM srifincredit_views.srifin_loan_applications_standardised`,
      statuses: `SELECT DISTINCT "app_status" FROM srifincredit_views.srifin_loan_applications_standardised`,
    };

    const dropdownData = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await executeAthenaQuery(query);
        
        // Use the actual column names from the query
        dropdownData[key] = result.map((item) => Object.values(item)[0]).filter(Boolean);
        
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
