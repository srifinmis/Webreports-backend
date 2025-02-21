const AWS = require("aws-sdk");
const athena = new AWS.Athena();
const fs = require('fs');

const logQuery = (query) => {
    const logEntry = `[${new Date().toISOString()}] ${query}\n`;
    fs.appendFileSync('query_logs.txt', logEntry, 'utf8');
  };
  
  const queryAthena = async (query) => {
    logQuery(query);
  
    const params = {
      QueryString: query,
      QueryExecutionContext: { Database: process.env.ATHENA_DATABASE },
      ResultConfiguration: { OutputLocation: process.env.ATHENA_OUTPUT_LOCATION },
    };
  
    try {
      const { QueryExecutionId } = await athena.startQueryExecution(params).promise();
      while (true) {
        const executionData = await athena.getQueryExecution({ QueryExecutionId }).promise();
        const state = executionData.QueryExecution.Status.State;
  
        if (state === 'SUCCEEDED') break;
        if (state === 'FAILED' || state === 'CANCELLED') throw new Error(`Query ${state}`);
  
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      let results = [];
      let nextToken = null;
  
      do {
        const resultParams = { QueryExecutionId, NextToken: nextToken };
        const pageResults = await athena.getQueryResults(resultParams).promise();
  
        const formattedData = pageResults.ResultSet.Rows.map(row => {
          return row.Data.reduce((acc, col, index) => {
            acc[`column${index + 1}`] = col.VarCharValue || '';
            return acc;
          }, {});
        });
  
        results = results.concat(formattedData);
        nextToken = pageResults.NextToken;
  
      } while (nextToken); 
      return results;
  
    } catch (error) {
      throw new Error(`Athena Query Error: ${error.message}`);
    }
  };
  module.exports = { queryAthena };