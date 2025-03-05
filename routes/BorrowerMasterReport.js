const express = require("express");
const router = express.Router();
const { executeAthenaQuery } = require("../utils/athenaUtils");

router.get("/dropdown-data-borrowermaster", async (req, res) => {
    try {
        const query = `SELECT DISTINCT "branch id", "branch name" FROM srifincredit_views.srifin_customer_master`;

        console.log(`Executing Athena Query for branches:`, query);
        const result = await executeAthenaQuery(query);
        console.log(`Athena Query Result for branches:`, result);

        // Map Athena result and combine BranchID and BranchName
        const branches = result.map(row => ({
            BranchID: row["branch id"],  
            BranchName: row["branch name"],
            DisplayName: `${row["branch id"]} - ${row["branch name"]}` // Combined column
        }));

        console.log("Processed Branches:", branches); // Debugging

        res.json({ branches });
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
