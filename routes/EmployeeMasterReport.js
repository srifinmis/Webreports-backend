const express = require("express");
const router = express.Router();
const { executeAthenaQuery } = require("../utils/athenaUtils");
router.get("/dropdown-data", async (req, res) => { 

    try {
        const query = `
            SELECT DISTINCT BranchID_Name, AreaID_Name, RegionID_Name, ClusterID_Name
            FROM srifincredit_views.vw_srifin_employee_master_report
        `;
  
        console.log("Executing Athena Query...");
        const result = await executeAthenaQuery(query);
        console.log("Raw Athena Result:", result);
  
        if (!result || result.length === 0) {
            console.warn("No data returned from Athena.");
            return res.json({ branches: [], areas: [], regions: [], clusters: [], branchMappings: {} });
        }
  
        // Initialize sets and mapping
        const branchMappings = {};
        const branches = new Set();
        const areas = new Set();
        const regions = new Set();
        const clusters = new Set();
  
        result.forEach((row) => {
            console.log("Row Data:", row);
  
            const branch = row["BranchID_Name"]?.trim() || null;
            const area = row["AreaID_Name"]?.trim() || null;
            const region = row["RegionID_Name"]?.trim() || null;
            const cluster = row["ClusterID_Name"]?.trim() || null;
  
            if (branch) {
                branches.add(branch);
                if (!branchMappings[branch]) {
                    branchMappings[branch] = { area: null, region: null, cluster: null };
                }
                if (area) branchMappings[branch].area = area;
                if (region) branchMappings[branch].region = region;
                if (cluster) branchMappings[branch].cluster = cluster;
            }
            if (area) areas.add(area);
            if (region) regions.add(region);
            if (cluster) clusters.add(cluster);
        });
  
        console.log("Final Data:", {
            branches: Array.from(branches),
            areas: Array.from(areas),
            regions: Array.from(regions),
            clusters: Array.from(clusters),
            branchMappings,
        });
  
        // Format response
        const formatDropdownData = (items) => Array.from(items).map((item) => ({ label: item, id: item }));
  
        res.json({
            branches: formatDropdownData(branches),
            areas: formatDropdownData(areas),
            regions: formatDropdownData(regions),
            clusters: formatDropdownData(clusters),
            branchMappings,
        });
    } catch (error) {
        console.error("Error fetching dropdown data:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
