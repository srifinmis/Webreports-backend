
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const vw_preclosure_report = sequelize.define('vw_preclosure_report', {

}, {
  tableName: 'vw_preclosure_report',
  timestamps: false,
});

module.exports = vw_preclosure_report;
  