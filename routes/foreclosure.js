const express = require("express");
const router = express.Router();
const { executeAthenaQuery } = require("../utils/athenaUtils");

router.get("/get-foreclosure-dropdowns", async (req, res) => {
  try {
    console.log("Fetching foreclosure dropdowns...");

    const query = `SELECT DISTINCT "Branch_ID", "region" FROM srifincredit_views.vw_preclosure_report`;
    const result = await executeAthenaQuery(query);

    console.log(`Foreclosure Data Received:`, result);

    if (!result || result.length === 0) {
      return res.json({ message: "No data available", branches: [],region: [], branchToRegionMap: {}, regionToBranchMap: {} });
    }

    if (result.length > 0 && result[0].Branch_ID === "Branch_ID") {
      console.log("Detected header row, removing...");
      result.shift(); // Remove the header row
    }
    
    const branchToRegionMap = {};
    const regionToBranchMap = {};
    const branches = [];
    
    result.forEach(row => {
      const branch = row.Branch_ID ? String(row.Branch_ID).trim() : "";
      const region = row.region ? String(row.region).trim() : "";
    
      if (branch) {
        branchToRegionMap[branch] = region;
        branches.push(branch);
      }
    
      if (region) {
        if (!regionToBranchMap[region]) regionToBranchMap[region] = new Set();
        regionToBranchMap[region].add(branch);
      }
    });
    
    // Convert Set to Array
    Object.keys(regionToBranchMap).forEach(region => {
      regionToBranchMap[region] = [...regionToBranchMap[region]];
    });
    
    console.log("Processed Data:", { branches, branchToRegionMap, regionToBranchMap });
    res.json({ branches, branchToRegionMap, regionToBranchMap });
    

  } catch (error) {
    console.error("❌ Error fetching foreclosure dropdowns:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
