const express = require("express");
const router = express.Router();
const reportService = require("../services/reportService");
const fs = require("fs");

router.post("/", async (req, res) => {
  const {
    reportType,
    branchId,
    branch_name,
    clusterName,
    creditAppStatus,
    region,
    appStatus,
    startDate,
    endDate,
    areaIdName,
    regionIdName,
  } = req.body;

  try {
    let reportData;
    let filePath;

    switch (reportType) {
      case "Fore Closure Report":
        reportData = await reportService.generateForeClosureReport(branchId, region);
        break;
      case "Borrower Master Report":
        reportData = await reportService.generateBorrowerMasterReport(branch_name, clusterName);
        break;
      case "Credit Report":
        reportData = await reportService.generateCreditReport(branchId, creditAppStatus, startDate, endDate);
        break;
      case "Loan Application Report":
        reportData = await reportService.generateLoanApplicationReport(branch_name, appStatus, startDate, endDate);
        break;
      case "Employee Master Report":
        reportData = await reportService.generateEmployeeMasterReport(branchId, areaIdName, regionIdName, clusterName);
        break;
      case "Death Report":
        reportData = await reportService.generateDeathReport(branchId, clusterName, region, startDate, endDate);
        break;
      default:
        return res.status(400).json({ error: "Invalid report type." });
    }

    filePath = await reportService.createReportFile(reportData, reportType.replace(/ /g, "_").toLowerCase());

    if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (err) {
          console.error("Error downloading the file:", err);
          res.status(500).json({ error: "Error while downloading the report." });
        }
        fs.unlinkSync(filePath);
      });
    } else {
      res.status(500).json({ error: "File not found." });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
