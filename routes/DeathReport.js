const express = require("express");
const router = express.Router();
const { executeAthenaQuery } = require("../utils/athenaUtils");

router.get("/dropdown-data", async (req, res) => {  try {
    const query = `
      SELECT DISTINCT "Branch" AS branch, "Cluster" AS cluster, "Region" AS region
      FROM srifincredit_views.vw_own_death_report
    `;

    const result = await executeAthenaQuery(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found for dropdowns" });
    }

    const branchMap = {};
    const branches = [];
    const clusters = new Map();
    const regions = new Map();

    result.forEach(({ branch, cluster, region }) => {
      if (branch && !branchMap[branch]) {
        branchMap[branch] = { 
          cluster: { name: cluster, id: cluster }, 
          region: { name: region, id: region }
        };
        branches.push({ name: branch, id: branch });
      }

      if (cluster && !clusters.has(cluster)) {
        clusters.set(cluster, { name: cluster, id: cluster });
      }

      if (region && !regions.has(region)) {
        regions.set(region, { name: region, id: region, clusterId: cluster });
      }
    });

    res.json({
      branches,
      clusters: Array.from(clusters.values()),
      regions: Array.from(regions.values()),
      branchMap
    });
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    res.status(500).json({ error: "Server error while fetching dropdown data" });
  }
});

module.exports = router;
