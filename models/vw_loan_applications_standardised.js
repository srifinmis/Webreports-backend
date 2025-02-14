
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const vw_loan_applications_standardised = sequelize.define('vw_loan_applications_standardised', {

}, {
  tableName: 'vw_loan_applications_standardised',
  timestamps: false,
});

module.exports = vw_loan_applications_standardised;
  