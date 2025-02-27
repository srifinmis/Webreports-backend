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
// app.get("/api/reports", async (req, res) => {
//   console.log("Received GET report request:", req.query);

//   const { reportType, branch, region, cluster, clusters, area, creditAppStatuses, app_status, branches, appStartDate, appEndDate } = req.query;

//   try {
//     switch (reportType) {
//       case "Loan Application Report":
//         return await reportService.generateLoanApplicationReport(branches, app_status, res);

//       case "Borrower Master Report":
//         return await reportService.generateBorrowerMasterReport(branch, clusters, res);

//       case "Credit Report":
//         return await reportService.generateCreditReport(branch, creditAppStatuses, res);

//       case "Fore Closure Report":
//         return await reportService.generateForeClosureReport(branch, region, res);

//       case "Employee Master Report":
//         return await reportService.generateEmployeeMasterReport(branch, area, region, cluster, req.query.employeeStatus, res);

//       case "Death Report":
//         return await reportService.generateDeathReport(branch, cluster, region, res);

//       default:
//         return res.status(400).json({ error: "Invalid report type." });
//     }
//   } catch (error) {
//     console.error(`Error generating ${reportType}:`, error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post("/report", async (req, res) => {
//   console.log("Received POST report request:", req.body);

//   const { reportType, branches, regions, clusters, areas, creditAppStatus, app_status, employeeStatuses, appStartDate, appEndDate } = req.body;

//   try {
//     switch (reportType) {
//       case "Loan Application Report":
//         return await reportService.generateLoanApplicationReport(branches, app_status, appStartDate, appEndDate, res);

//       case "Borrower Master Report":
//         return await reportService.generateBorrowerMasterReport(branches, clusters, res);

//       case "Credit Report":
//         return await reportService.generateCreditReport(branches, creditAppStatus, appStartDate, appEndDate, res);

//       case "Fore Closure Report":
//         return await reportService.generateForeClosureReport(branches, regions, res);

//       case "Employee Master Report":
//         return await reportService.generateEmployeeMasterReport(branches, areas, regions, clusters, employeeStatuses, res);

//       case "Death Report":
//         return await reportService.generateDeathReport(branches, clusters, regions, res);

//       default:
//         return res.status(400).json({ error: "Invalid report type." });
//     }
//   } catch (error) {
//     console.error(`Error generating ${reportType}:`, error);
//     res.status(500).json({ error: error.message });
//   }
// });

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
  app.get("/api/dropdown-data-loan", async (req, res) => {
  try {
    // Queries for fetching distinct values
    const queries = {
      zones: `SELECT DISTINCT "zone name" FROM srifincredit_views.srifin_loan_details`,
      clusters: `SELECT DISTINCT "cluster name" AS value FROM srifincredit_views.srifin_loan_details`,
      regions: `SELECT DISTINCT "region name" AS value FROM srifincredit_views.srifin_loan_details`,
      branches: `SELECT DISTINCT "branch name" AS value FROM srifincredit_views.srifin_loan_details`,
      customers: `SELECT DISTINCT "customer_id" AS value FROM srifincredit_views.srifin_loan_details`,
      loanApplications: `SELECT DISTINCT "loan_application_id" AS value FROM srifincredit_views.srifin_loan_details`,
      statuses: `SELECT DISTINCT "IS_Dead" AS value FROM srifincredit_views.srifin_loan_details`
    };

  const dropdownData = {};

  for (const [key, query] of Object.entries(queries)) {
    try {
      const result = await queryAthena(query); // Executing one query at a time
      dropdownData[key] = result.slice(1).map((item) => item.column1).filter(Boolean); // Removing null values
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      dropdownData[key] = []; // If an error occurs, return an empty array
    }
  }

  res.json(dropdownData);
} catch (error) {
  console.error("Error fetching dropdowns:", error);
  res.status(500).json({ error: error.message });
}
});
app.get("/get-foreclosure-dropdowns", async (req, res) => {
  try {
    const queries = {
      regions: `SELECT DISTINCT "region" AS value FROM srifincredit_views.vw_preclosure_report`,
      branches: `SELECT DISTINCT "Branch_ID", "region" FROM srifincredit_views.vw_preclosure_report`,
    };

    const dropdownData = { branches: [], regions: [], branchRegionMap: {}, regionBranchMap: {} };

    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await executeAthenaQuery(query); 
        
        if (key === "branches") {
          result.forEach((row) => {
            if (row.Branch_ID && row.region) {
              dropdownData.branches.push(row.Branch_ID);
              dropdownData.branchRegionMap[row.Branch_ID] = row.region;

              // Populate regionBranchMap
              if (!dropdownData.regionBranchMap[row.region]) {
                dropdownData.regionBranchMap[row.region] = [];
              }
              dropdownData.regionBranchMap[row.region].push(row.Branch_ID);
            }
          });
        } else {
          dropdownData[key] = result.map((item) => item.value).filter(Boolean);
        }
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

  app.get("/api/dropdown-data-deathreport", async (req, res) => {
    try {
      const query = `
        SELECT DISTINCT "Branch" AS branch, "Cluster" AS cluster, "Region" AS region
        FROM srifincredit_views.vw_own_death_report
      `;

      const result = await executeAthenaQuery(query);

      const branchMap = {};
      const branches = [];
      const clusters = new Map();
      const regions = new Map();

      result.forEach(({ branch, cluster, region }) => {
        if (branch) {
          if (!branchMap[branch]) {
            branchMap[branch] = { 
              cluster: { name: cluster, id: cluster }, 
              region: { name: region, id: region }
            };
            branches.push({ name: branch, id: branch });
          }
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
      res.status(500).json({ error: error.message });
    }
  });

// dropdown-data-loanapplication
app.get("/api/dropdown-data-loanapplication", async (req, res) => {
  try {
    // Queries for fetching distinct values
    const queries = {
      branches: `SELECT DISTINCT "branch name" AS value FROM srifincredit_views.srifin_loan_applications_standardised`,
      statuses: `SELECT DISTINCT "app_status" AS value FROM srifincredit_views.srifin_loan_applications_standardised`,
      appDates: `SELECT DISTINCT "app_date" AS value FROM srifincredit_views.srifin_loan_applications_standardised`, // Added App Date
    };

    const dropdownData = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await queryAthena(query);
        dropdownData[key] = result.map((item) => item.column1).filter(Boolean);
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


// dropdown-data-creditreport
app.get("/api/dropdown-data-creditreport", async (req, res) => {
  try {
    // Queries for fetching distinct values
    const queries = {
      statuses: `SELECT DISTINCT "Credit_App_Status" AS value FROM srifincredit_views.vw_process_credit_report`,
      branches: `SELECT DISTINCT "BranchID_Name" AS value FROM srifincredit_views.vw_process_credit_report`
    };

    const dropdownData = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await queryAthena(query); // Executing query
        dropdownData[key] = Array.isArray(result) ? result.map(item => item.column1).filter(Boolean) : [];
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        dropdownData[key] = []; // If an error occurs, return an empty array
      }
    }

    res.json(dropdownData);
  } catch (error) {
    console.error("Error fetching dropdowns:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/dropdown-data-employeemaster", async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT "BranchID_Name", "AreaID_Name", "RegionID_Name", "ClusterID_Name"
      FROM srifincredit_views.vw_srifin_employee_master_report
    `;

    console.log("Executing Athena Query...");
    const result = await queryAthena(query);

    console.log("Athena Query Result Count:", result.length);
    // console.log("Sample Data:", result.slice(0, 5)); // Check first 5 rows

    if (!result || result.length === 0) {
      console.warn("No data returned from Athena.");
      return res.json({
        branches: [],
        areas: [],
        regions: [],
        clusters: [],
        branchMappings: {},
      });
    }

    const branchMappings = {};
    const branches = new Set();
    const areas = new Set();
    const regions = new Set();
    const clusters = new Set();

    result.forEach((row, index) => {
      // console.log(`Row ${index}:`, row); // Debugging log

      // Map the correct column names
      const branch = row["column1"]?.trim() || null;  // BranchID_Name
      const area = row["column2"]?.trim() || null;    // AreaID_Name
      const region = row["column3"]?.trim() || null;  // RegionID_Name
      const cluster = row["column4"]?.trim() || null; // ClusterID_Name

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

    const formatDropdownData = (items) =>
      Array.from(items).map((item) => ({ label: item, id: item }));

    const dropdownData = {
      branches: formatDropdownData(branches),
      areas: formatDropdownData(areas),
      regions: formatDropdownData(regions),
      clusters: formatDropdownData(clusters),
      branchMappings,
    };

    console.log("Processed Dropdown Data:", JSON.stringify(dropdownData, null, 2));
    res.json(dropdownData);
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/generate-employee-master-report", async (req, res) => {
  const { branchID, areaID, regionID, clusterID, employeeStatus } = req.body;

  try {
    let query = `
      SELECT * FROM srifincredit_views.vw_srifin_employee_master_report
      WHERE 1=1
    `;

    if (branchID) {
      query += ` AND "BranchID_Name" = '${branchID}'`;
    }
    if (areaID) {
      query += ` AND "AreaID_Name" = '${areaID}'`;
    }
    if (regionID) {
      query += ` AND "RegionID_Name" = '${regionID}'`;
    }
    if (clusterID) {
      query += ` AND "ClusterID_Name" = '${clusterID}'`;
    }
    if (employeeStatus && employeeStatus.length > 0) {
      const statusConditions = employeeStatus.map(status => `"Employee_Status" = '${status}'`).join(" OR ");
      query += ` AND (${statusConditions})`;
    }

    console.log("Executing Athena Query:", query);

    const result = await executeAthenaQuery(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error generating Employee Master Report:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-deathreport", async (req, res) => {
  const { Cluster, Region, Branch } = req.body;

  try {
    let conditions = [];
    
    // Only add conditions for fields that are provided
    if (Cluster) conditions.push(`"Cluster" = '${Cluster.replace(/'/g, "''")}'`);
    if (Region) conditions.push(`"Region" = '${Region.replace(/'/g, "''")}'`);
    if (Branch) conditions.push(`"Branch" = '${Branch.replace(/'/g, "''")}'`);

    // Construct WHERE clause dynamically
    let whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let query = `
      SELECT * FROM srifincredit_views.vw_own_death_report
      ${whereClause}
    `;

    console.log("Executing Athena Query:", query);

    const result = await executeAthenaQuery(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error generating Death Report:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/dropdown-data-borrowermaster", async (req, res) => {
  try {
    const queries = {
      branches: `SELECT DISTINCT "branch id", "branch name" FROM srifincredit_views.srifin_customer_master`,
      clusters: `SELECT DISTINCT "cluster name" FROM srifincredit_views.srifin_customer_master`,
      clusterBranchMap: `SELECT DISTINCT "cluster name", "branch name" FROM srifincredit_views.srifin_customer_master`,
    };

    const dropdownData = { branches: [], clusters: [], clusterBranchMap: {} };

    for (const [key, query] of Object.entries(queries)) {
      try {
        console.log(`Executing Athena Query for ${key}:`, query); // Debugging Log
        const result = await executeAthenaQuery(query);
        console.log(`Athena Query Result for ${key}:`, result); // Log Results

        if (key === "branches") {
          dropdownData.branches = result
            .filter(row => row["branch id"] && row["branch name"]) // Ensure both exist
            .map(row => ({
              BranchID: row["branch id"],
              BranchName: row["branch name"],
            }));
        } else if (key === "clusters") {
          dropdownData.clusters = result.map((item) => item["cluster name"]).filter(Boolean);
        } else if (key === "clusterBranchMap") {
          dropdownData.clusterBranchMap = result.reduce((acc, row) => {
            if (row["cluster name"] && row["branch name"]) {
              if (!acc[row["cluster name"]]) {
                acc[row["cluster name"]] = [];
              }
              acc[row["cluster name"]].push(row["branch name"]); // Group branches under cluster
            }
            return acc;
          }, {});
        }
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        dropdownData[key] = key === "clusterBranchMap" ? {} : [];
      }
    }

    console.log("Final Dropdown Data:", JSON.stringify(dropdownData, null, 2)); // Log Final Response
    res.json(dropdownData);
  } catch (error) {
    console.error("Error fetching dropdowns:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-foreclosure-report", async (req, res) => {
  const { branchName, regionName } = req.body;

  try {
    // Prevent SQL injection
    const formattedBranchName = branchName ? branchName.replace(/'/g, "''") : null;
    const formattedRegionName = regionName ? regionName.replace(/'/g, "''") : null;

    let query = `SELECT * FROM srifincredit_views.vw_preclosure_report WHERE 1=1`;

    if (formattedBranchName) {
      query += ` AND "Branch_ID" = '${formattedBranchName}'`;
    }

    if (formattedRegionName) {
      query += ` AND "region" = '${formattedRegionName}'`;
    }

    console.log("Executing Athena Query:", query);

    const result = await executeAthenaQuery(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error generating foreclosure report:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/generate-creditreport", async (req, res) => {
  const { branchID, creditAppStatus, startDate, endDate } = req.body;

  if (!branchID || !startDate || !endDate) {
    return res.status(400).json({ error: "Branch, Start Date, and End Date are required" });
  }

  try {
    let query = `
      SELECT * FROM srifincredit_views.vw_process_credit_report
      WHERE "BranchID_Name" = '${branchID}'
      AND "app_date" BETWEEN '${startDate}' AND '${endDate}'
    `;

    if (creditAppStatus) {
      query += ` AND "Credit_App_Status" = '${creditAppStatus}'`;
    }

    console.log("Executing Athena Query:", query);

    const result = await executeAthenaQuery(query);

    console.log("Athena Query Result:", JSON.stringify(result, null, 2)); // Log API Response

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error generating Credit Report:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/generate-loanapplication-report", async (req, res) => {
  const { branchName, appStatus, appDate } = req.body;

  if (!branchName || !appDate?.start || !appDate?.end) {
    return res.status(400).json({ error: "Branch Name, Start Date, and End Date are required" });
  }

  try {
    // Safely format values to prevent SQL injection
    const formattedBranchName = branchName.replace(/'/g, "''");
    const formattedStartDate = appDate.start.replace(/'/g, "''");
    const formattedEndDate = appDate.end.replace(/'/g, "''");

    let query = `
      SELECT * FROM srifincredit_views.srifin_loan_applications_standardised
      WHERE "branch name" = '${formattedBranchName}'
      AND CAST("app_date" AS DATE) BETWEEN DATE '${formattedStartDate}' AND DATE '${formattedEndDate}'
    `;

    if (appStatus && appStatus.length > 0) {
      const formattedStatuses = appStatus.map(status => `'${status.replace(/'/g, "''")}'`).join(", ");
      query += ` AND "app_status" IN (${formattedStatuses})`;
    }

    console.log("Executing Athena Query:", query);

    // Use executeAthenaQuery instead of queryAthena
    const result = await executeAthenaQuery(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    // Remove first column dynamically
    const processedResult = result.map(row => {
      const values = Object.values(row);
      const [, ...newValues] = values; // Remove first column
      const keys = Object.keys(row).slice(1); // Remove first column header
      return Object.fromEntries(keys.map((key, i) => [key, newValues[i]]));
    });

    res.status(200).json(processedResult);
  } catch (error) {
    console.error("Error generating Loan Application Report:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/generate-borrowermaster-report", async (req, res) => {
  const { branchName } = req.body;

  if (!branchName) {
    return res.status(400).json({ error: "Branch Name is required" });
  }

  try {
    let query = `
      SELECT * FROM srifin_customer_master
      WHERE "branch name" = '${branchName}'
    `;

    console.log("Executing Athena Query:", query);

    const result = await executeAthenaQuery(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json(result.slice(0));
  } catch (error) {
    console.error("Error generating Borrower Master Report:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-loan-details-report", async (req, res) => {
  const { zoneName, clusterName, regionName, branchName, customerId, loanApplicationId, isDead } = req.body;
  
  if (!branchName) {
    return res.status(400).json({ error: "Branch Name is required" });
  }
  
  try {
    let query = `
      SELECT * FROM srifincredit_views.srifin_loan_details 
      WHERE "branch name" = '${branchName}'
      `;
  
      if (zoneName) query += ` AND "zone name" = '${zoneName}'`;
      if (clusterName) query += ` AND "cluster name" = '${clusterName}'`;
      if (regionName) query += ` AND "region name" = '${regionName}'`;
      if (customerId) query += ` AND customer_id = '${customerId}'`;
      if (loanApplicationId) query += ` AND loan_application_id = '${loanApplicationId}'`;
      if (isDead) query += ` AND is_dead = '${isDead}'`;
  
      console.log("Executing Athena Query:", query);
  
      const result = await queryAthena(query);
  
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "No data found" });
      }
  
      res.status(200).json(result.slice(1));
    } catch (error) {
      console.error("Error generating loan details report:", error);
      res.status(500).json({ error: error.message });
  }
});
app.get("/api/dropdown-data-luc", async (req, res) => {
  try {
    const queries = {
      zones: `SELECT DISTINCT "zone name" AS value FROM srifincredit_views.vw_luc_report`,
      clusters: `SELECT DISTINCT "cluster name" AS value FROM srifincredit_views.vw_luc_report`,
      regions: `SELECT DISTINCT "region name" AS value FROM srifincredit_views.vw_luc_report`,
      branches: `SELECT DISTINCT "branch name" AS value FROM srifincredit_views.vw_luc_report`,
    };

    const dropdownData = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await queryAthena(query); // Executing one query at a time
        dropdownData[key] = result.slice(1).map((item) => item.column1).filter(Boolean); // Removing null values
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        dropdownData[key] = []; // If an error occurs, return an empty array
      }
    }

    res.json(dropdownData);
  } catch (error) {
    console.error("Error fetching dropdowns:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-luc-details-report", async (req, res) => {
  const { zoneName, clusterName, regionName, branchName, customerId, lucApplicationId, isDead } = req.body;

  if (!branchName) {
    return res.status(400).json({ error: "Branch Name is required" });
  }

  try {
    let query = `
      SELECT * FROM srifincredit_views.vw_luc_report 
      WHERE "branch name" = '${branchName}'
      `;

    if (zoneName) query += ` AND "zone name" = '${zoneName}'`;
    if (clusterName) query += ` AND "cluster name" = '${clusterName}'`;
    if (regionName) query += ` AND "region name" = '${regionName}'`;
    if (customerId) query += ` AND customer_id = '${customerId}'`;
    
    console.log("Executing Athena Query:", query);

    const result = await queryAthena(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json(result.slice(1));
  } catch (error) {
    console.error("Error generating LUC details report:", error);
    res.status(500).json({ error: error.message });
  }
});

  


app.use((req, res) => {
  console.log(`Unhandled request: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

// Start Server
app.listen(port, () => console.log(`✅ Server running at: http://localhost:${port}`));
