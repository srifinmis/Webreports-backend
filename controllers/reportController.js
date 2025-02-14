// const { generateCSVReport, validateForm } = require('../services/reportService');

// const generateReport = async (req, res) => {
//   const form = req.body;
//   console.log('Received form data:', form);

//   const { reportType } = form;
//   if (!reportType) {
//     return res.status(400).json({ error: "Report type is required" });
//   }

//   const errors = validateForm(form, reportType);
//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({ errors });
//   }

//   try {
//     // Call the appropriate function based on the report type
//     let reportData;
//     switch (reportType) {
//       case "Fore Closure Report":
//         reportData = await generateForeClosureReport(form.branchId, form.region);
//         break;
//       case "Borrower Master Report":
//         reportData = await generateBorrowerMasterReport(form.branchName, form.clusterName);
//         break;
//       case "Credit Report":
//         reportData = await generateCreditReport(form.creditAppStatus, form.region);
//         break;
//       case "Loan Application Report":
//         reportData = await generateLoanApplicationReport(form.appDate, form.branchName);
//         break;
//       case "Employee Master Report":
//         reportData = await generateEmployeeMasterReport(form.branchId, form.areaIdName, form.regionIdName);
//         break;
//       case "Death Report":
//         reportData = await generateDeathReportWithColumns(form.branchId, form.clusterName, form.appDate);
//         break;
//       default:
//         return res.status(400).json({ errors: "Invalid report type." });
//     }

//     // Generate the CSV file
//     const fileName = await generateCSVReport(form, reportType);
//     const downloadLink = `http://localhost:5000/reports/${fileName}`;

//     // Save the report in the database (optional)
//     await Report.create({
//       reportType,
//       startDate: form.startDate,
//       endDate: form.endDate,
//       branchId: form.branchId,
//       branchName: form.branchName,
//     });

//     // Return success response
//     res.status(200).json({
//       message: 'Report generated successfully!',
//       downloadLink,
//       data: reportData,  // You can also return the report data here if needed
//     });
//   } catch (error) {
//     console.error("Error generating report:", error);
//     res.status(500).json({ message: 'Error generating report', error: error.message });
//   }
// };

// module.exports = { generateReport };
