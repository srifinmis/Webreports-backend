const AWS = require("aws-sdk");
const athena = new AWS.Athena();

const executeAthenaQuery = async (query) => {
  const params = {
    QueryString: query,
    QueryExecutionContext: { Database: "srifincredit_views" },
    ResultConfiguration: { OutputLocation: "s3://sfin-reporting-layer-logs/MIS_Query_Logs" },
  };

  const { QueryExecutionId } = await athena.startQueryExecution(params).promise();
  let queryStatus;

  do {
    const result = await athena.getQueryExecution({ QueryExecutionId }).promise();
    queryStatus = result.QueryExecution.Status.State;
    if (queryStatus === "FAILED" || queryStatus === "CANCELLED") {
      throw new Error(result.QueryExecution.Status.StateChangeReason);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } while (queryStatus === "RUNNING" || queryStatus === "QUEUED");

  const results = await athena.getQueryResults({ QueryExecutionId }).promise();
  
  if (!results || !results.ResultSet || !results.ResultSet.Rows || results.ResultSet.Rows.length <= 1) {
    console.warn("Athena query returned no data.");
    return null;
  }

  const headers = results.ResultSet.Rows[0].Data.map((col) => col.VarCharValue || "");
  const data = results.ResultSet.Rows.slice(1).map((row) =>
    row.Data.reduce((acc, col, i) => {
      acc[headers[i]] = col.VarCharValue || "";
      return acc;
    }, {})
  );

  return data.length > 0 ? data : null;
};

module.exports = { executeAthenaQuery };
