
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const vw_own_death_report = sequelize.define('vw_own_death_report', {

}, {
  tableName: 'vw_own_death_report',
  timestamps: false,
});

module.exports = vw_own_death_report;
  