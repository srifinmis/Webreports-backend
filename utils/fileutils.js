const fs = require("fs");
const { Parser } = require("json2csv");

const createCSVFile = async (data, filename) => {
  try {
    if (!data || data.length === 0) {
      console.warn("No data to write to CSV.");
      return null;
    }

    const parser = new Parser();
    const csv = parser.parse(data);
    const filePath = `./downloads/${filename}.csv`;
    
    fs.writeFileSync(filePath, csv);
    console.log("CSV file created:", filePath);

    return filePath;
  } catch (error) {
    console.error("Error generating CSV file:", error);
    return null;
  }
};

module.exports = { createCSVFile };
