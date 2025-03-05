require("dotenv").config();

const { 
  AthenaClient, 
  StartQueryExecutionCommand, 
  GetQueryExecutionCommand, 
  GetQueryResultsCommand 
} = require("@aws-sdk/client-athena");

const athenaClient = new AthenaClient({ 
  region: process.env.AWS_REGION // Ensure region is set correctly
});

const executeAthenaQuery = async (query) => {
  const params = {
    QueryString: query,
    QueryExecutionContext: { Database: process.env.ATHENA_DATABASE }, // Use env variable
    ResultConfiguration: { OutputLocation: process.env.ATHENA_OUTPUT_LOCATION }, // Use env variable
  };

  try {
    const { QueryExecutionId } = await athenaClient.send(new StartQueryExecutionCommand(params));
    console.log(`✅ Query Started: ${QueryExecutionId}`);

    let queryStatus;

    do {
      const result = await athenaClient.send(new GetQueryExecutionCommand({ QueryExecutionId }));
      queryStatus = result.QueryExecution.Status.State;

      if (queryStatus === "FAILED" || queryStatus === "CANCELLED") {
        throw new Error(result.QueryExecution.Status.StateChangeReason);
      }

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait before checking again
    } while (queryStatus === "RUNNING" || queryStatus === "QUEUED");

    const results = await athenaClient.send(new GetQueryResultsCommand({ QueryExecutionId }));

    if (!results.ResultSet.Rows || results.ResultSet.Rows.length <= 1) {
      console.warn("⚠️ Athena query returned no data.");
      return null;
    }

    // Extract headers from the first row
    const headers = results.ResultSet.Rows[0].Data.map((col) => col.VarCharValue || "");
    
    // Convert rows into JSON format
    const data = results.ResultSet.Rows.slice(1).map((row) =>
      row.Data.reduce((acc, col, i) => {
        acc[headers[i]] = col.VarCharValue || "";
        return acc;
      }, {})
    );

    return data.length > 0 ? data : null;
  } catch (error) {
    console.error("❌ Athena Query Error:", error.message);
    throw new Error(`Athena Query Error: ${error.message}`);
  }
};

module.exports = { executeAthenaQuery };
