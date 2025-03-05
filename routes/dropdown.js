const express = require("express");
const router = express.Router();
const { executeAthenaQuery } = require("../utils/athenaUtils");

// 🔹 Foreclosure Report Dropdown API
router.get("/get-foreclosure-dropdowns", async (req, res) => {
  try {
    console.log("Fetching foreclosure dropdowns...");

    const query = `SELECT DISTINCT "Branch_ID", "region" FROM srifincredit_views.vw_preclosure_report`;
    const result = await executeAthenaQuery(query);

    console.log(`Foreclosure Data Received:`, result);

    const branchToRegionMap = {};
    const regionToBranchMap = {};

    result.forEach(row => {
      const branch = row.Branch?.trim() || "";  // Trim spaces
      const region = row.Region?.trim() || "";

      if (branch) branchToRegionMap[branch] = region;

      if (region) {
        if (!regionToBranchMap[region]) regionToBranchMap[region] = new Set();
        regionToBranchMap[region].add(branch);
      }
    });

    // Convert sets to arrays
    Object.keys(regionToBranchMap).forEach(region => {
      regionToBranchMap[region] = [...regionToBranchMap[region]];
    });

    console.log("Processed Data:", { branchToRegionMap, regionToBranchMap });
    res.json({ branchToRegionMap, regionToBranchMap });

  } catch (error) {
    console.error("Error fetching foreclosure dropdowns:", error);
    res.status(500).json({ error: error.message });
  }
});

// app.get("/api/dropdown-data-borrowermaster", async (req, res) => {
//   try {
//     const queries = {
//       branches: `SELECT DISTINCT "branch id", "branch name" FROM srifincredit_views.srifin_customer_master`,
//       clusters: `SELECT DISTINCT "cluster name" FROM srifincredit_views.srifin_customer_master`,
//       clusterBranchMap: `SELECT DISTINCT "cluster name", "branch name" FROM srifincredit_views.srifin_customer_master`,
//     };

//     const dropdownData = { branches: [], clusters: [], clusterBranchMap: {} };

//     for (const [key, query] of Object.entries(queries)) {
//       try {
//         console.log(`Executing Athena Query for ${key}:`, query); // Debugging Log
//         const result = await executeAthenaQuery(query);
//         console.log(`Athena Query Result for ${key}:`, result); // Log Results

//         if (key === "branches") {
//           dropdownData.branches = result
//             .filter(row => row["branch id"] && row["branch name"]) // Ensure both exist
//             .map(row => ({
//               BranchID: row["branch id"],
//               BranchName: row["branch name"],
//             }));
//         } else if (key === "clusters") {
//           dropdownData.clusters = result.map((item) => item["cluster name"]).filter(Boolean);
//         } else if (key === "clusterBranchMap") {
//           dropdownData.clusterBranchMap = result.reduce((acc, row) => {
//             if (row["cluster name"] && row["branch name"]) {
//               if (!acc[row["cluster name"]]) {
//                 acc[row["cluster name"]] = [];
//               }
//               acc[row["cluster name"]].push(row["branch name"]); // Group branches under cluster
//             }
//             return acc;
//           }, {});
//         }
//       } catch (error) {
//         console.error(`Error fetching ${key}:`, error);
//         dropdownData[key] = key === "clusterBranchMap" ? {} : [];
//       }
//     }

//     console.log("Final Dropdown Data:", JSON.stringify(dropdownData, null, 2)); // Log Final Response
//     res.json(dropdownData);
//   } catch (error) {
//     console.error("Error fetching dropdowns:", error);
//     res.status(500).json({ error: error.message });
//   }
// });
module.exports = router;
