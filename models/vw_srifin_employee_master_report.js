
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const vw_srifin_employee_master_report = sequelize.define('vw_srifin_employee_master_report', {

}, {
  tableName: 'vw_srifin_employee_master_report',
  timestamps: false,
});

module.exports = vw_srifin_employee_master_report;
  