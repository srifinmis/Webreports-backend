const { executeAthenaQuery } = require("../utils/athenaUtils");

async function generateForeClosureReport(branchName, regionName) {
  try {
    console.log("🔍 Received Branch_ID:", branchName);
    console.log("🔍 Received Region:", regionName);

    const formattedBranchName = branchName ? branchName.replace(/\s+/g, "_") : null;
    const formattedRegionName = regionName ? regionName.replace(/\s+/g, "_") : null;

    let query = `SELECT * FROM srifincredit_views.vw_preclosure_report`;
    let conditions = [];

    if (formattedBranchName) conditions.push(`"Branch_ID" = '${formattedBranchName}'`);
    if (formattedRegionName) conditions.push(`"region" = '${formattedRegionName}'`);

    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");

    console.log("🚀 Executing Athena Query:", query);
    const result = await executeAthenaQuery(query);

    if (!result || result.length === 0) {
      console.warn("⚠️ Athena Query Returned No Data.");
      return [];
    }

    console.log("✅ Athena Query Result:", result);
    return result;
  } catch (error) {
    console.error("❌ Error generating foreclosure report:", error);
    throw error;
  }
}

async function generateBorrowerMasterReport(branchName) {
  try {
    console.log("🔍 Received Branch Name:", branchName, "| Type:", typeof branchName);

    if (branchName && typeof branchName !== "string") {
      console.error("❌ ERROR: branchName should be a string, received:", typeof branchName, branchName);
      return [];
    }

    const formattedBranchName = branchName ? branchName.replace(/'/g, "''") : null;

    let query = `SELECT * FROM srifin_customer_master`;
    if (formattedBranchName) {
      query += ` WHERE "branch name" = '${formattedBranchName}'`;
    }

    console.log("🚀 Executing Athena Query:", query);
    const result = await executeAthenaQuery(query);

    console.log("✅ Raw Athena Response:", result, "| Type:", typeof result);

    if (!result || !Array.isArray(result) || result.length === 0) {
      console.warn("⚠️ Athena Query Returned No Data.");
      return [];
    }

    return result;
  } catch (error) {
    console.error("❌ Error generating Borrower Master Report:", error);
    throw error;
  }
}

async function generateCreditReport(branchID, creditAppStatus, startDate, endDate) {
  try {
    console.log("🔍 Received Params:", { branchID, creditAppStatus, startDate, endDate });

    if (!branchID || !startDate || !endDate) {
      console.error("❌ ERROR: Missing required parameters");
      return [];
    }

    let query = `
      SELECT * FROM srifincredit_views.vw_process_credit_report
      WHERE "BranchID_Name" = '${branchID}'
      AND "app_date" BETWEEN '${startDate}' AND '${endDate}'
    `;

    if (creditAppStatus) {
      query += ` AND "Credit_App_Status" = '${creditAppStatus}'`;
    }

    console.log("🚀 Executing Athena Query:", query);
    const result = await executeAthenaQuery(query);

    if (!result) {
      console.error("❌ ERROR: Athena query returned undefined or null");
      return [];
    }

    if (!Array.isArray(result)) {
      console.error("❌ ERROR: Athena response is not an array! Received type:", typeof result, "Data:", result);
      return [];
    }

    console.log("✅ Athena Query Result:", result);
    return result;
  } catch (error) {
    console.error("❌ Error generating Credit Report:", error);
    throw error;
  }
}
async function generateLoanApplicationReport(branchName, appStatus, appDate) {
  try {
    if (!branchName || !appDate?.start || !appDate?.end) {
      throw new Error("Branch Name, Start Date, and End Date are required");
    }

    const formattedBranchName = branchName.replace(/'/g, "''");
    const formattedStartDate = appDate.start.replace(/'/g, "''");
    const formattedEndDate = appDate.end.replace(/'/g, "''");

    let query = `
      SELECT * FROM srifincredit_views.srifin_loan_applications_standardised
      WHERE "branch name" = '${formattedBranchName}'
      AND CAST("app_date" AS DATE) BETWEEN DATE '${formattedStartDate}' AND DATE '${formattedEndDate}'
    `;

    if (Array.isArray(appStatus) && appStatus.length > 0) {
      const formattedStatuses = appStatus.map(status => `'${status.replace(/'/g, "''")}'`).join(", ");
      query += ` AND "app_status" IN (${formattedStatuses})`;
    }

    console.log("🚀 Executing Athena Query:", query);
    const result = await executeAthenaQuery(query);

    // Ensure result is an array, otherwise return an empty array
    const processedResult = Array.isArray(result) ? result : [];

    return processedResult;
  } catch (error) {
    console.error("❌ Error generating Loan Application Report:", error);
    throw error;
  }
}
// Assuming you're using an asynchronous function to handle the report generation
async function generateEmployeeMasterReport(filters) {
  const { branchID, areaID, regionID, clusterID, employeeStatus } = filters;

  // Ensure branchID is required
  if (!branchID) {
    console.error("❌ ERROR: Missing required parameter: branchID");
    return [];
  }

  // Start building the query with the branch filter
  let query = `SELECT * FROM srifincredit_views.vw_srifin_employee_master_report WHERE "BranchID_Name" = '${branchID}'`;

  // Add filters dynamically based on provided data
  let conditions = [];

  if (areaID) {
    conditions.push(`"AreaID_Name" = '${areaID}'`);
  }

  if (regionID) {
    conditions.push(`"RegionID_Name" = '${regionID}'`);
  }

  if (clusterID) {
    conditions.push(`"ClusterID_Name" = '${clusterID}'`);
  }

  if (employeeStatus && employeeStatus.length > 0) {
    const statusConditions = employeeStatus.map(status => `"Employee_Status" = '${status}'`).join(" OR ");
    conditions.push(`(${statusConditions})`);
  }

  // If there are additional conditions, add them to the query
  if (conditions.length > 0) {
    query += ` AND ${conditions.join(" AND ")}`;
  }

  // Log the final query for debugging
  console.log("🚀 Executing Athena Query:", query);

  // Execute the query with Athena (assuming a query execution function exists)
  try {
    const result = await executeAthenaQuery(query); // Assuming executeAthenaQuery is a function that executes the Athena query
    return result;
  } catch (error) {
    console.error("❌ ERROR executing query:", error);
    return [];
  }
}



// Function to generate death report
async function generateDeathReport(filters) {
  const { Cluster, Region, Branch } = filters;

  // Ensure at least one required parameter is provided
  if (!Cluster && !Region && !Branch) {
    console.error("❌ ERROR: At least one of Cluster, Region, or Branch is required");
    return [];
  }

  // Start building the query with the base selection
  let query = `SELECT * FROM srifincredit_views.vw_own_death_report`;

  // Initialize conditions array for dynamic filters
  let conditions = [];

  // Add conditions based on the filters provided
  if (Cluster) {
    conditions.push(`"Cluster" = '${Cluster.replace(/'/g, "''")}'`);
  }

  if (Region) {
    conditions.push(`"Region" = '${Region.replace(/'/g, "''")}'`);
  }

  if (Branch) {
    conditions.push(`"Branch" = '${Branch.replace(/'/g, "''")}'`);
  }

  // If there are any conditions, add them to the WHERE clause
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Log the final query for debugging purposes
  console.log("🚀 Executing Athena Query:", query);

  // Execute the query with Athena
  try {
    const result = await executeAthenaQuery(query); // Assuming executeAthenaQuery is a function that executes the Athena query
    return result;
  } catch (error) {
    console.error("❌ ERROR executing query:", error);
    return [];
  }
}


module.exports = { 
  generateForeClosureReport, 
  generateBorrowerMasterReport,
  generateCreditReport,
  generateLoanApplicationReport,
  generateEmployeeMasterReport,
  generateDeathReport // ✅ Added Death Report Function
};


