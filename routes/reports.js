// const express = require("express");
// const router = express.Router();
// const { executeAthenaQuery } = require("../utils/athenaUtils");

// // 🔹 Foreclosure Report Dropdown API
// router.get("/get-foreclosure-dropdowns", async (req, res) => {
//   try {
//     console.log("Fetching foreclosure dropdowns...");

//     const query = `SELECT DISTINCT TRIM("Branch") AS Branch, TRIM("Region") AS Region 
//                    FROM srifincredit_views.vw_preclosure_report`;
//     const result = await executeAthenaQuery(query);

//     console.log(`Foreclosure Data Received:`, result);

//     const branchToRegionMap = {};
//     const regionToBranchMap = {};

//     result.forEach(row => {
//       const branch = row.Branch?.trim() || "";
//       const region = row.Region?.trim() || "";

//       if (branch) branchToRegionMap[branch] = region;

//       if (region) {
//         if (!regionToBranchMap[region]) regionToBranchMap[region] = new Set();
//         regionToBranchMap[region].add(branch);
//       }
//     });

//     // Convert sets to arrays and remove duplicates
//     Object.keys(regionToBranchMap).forEach(region => {
//       regionToBranchMap[region] = [...new Set(regionToBranchMap[region])];
//     });

//     console.log("✅ Processed Data:", { branchToRegionMap, regionToBranchMap });
//     res.json({ branchToRegionMap, regionToBranchMap });

//   } catch (error) {
//     console.error("❌ Error fetching foreclosure dropdowns:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
