
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const vw_process_credit_report = sequelize.define('vw_process_credit_report', {

}, {
  tableName: 'vw_process_credit_report',
  timestamps: false,
});

module.exports = vw_process_credit_report;
  