
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const srifin_customer_master = sequelize.define('srifin_customer_master', {

}, {
  tableName: 'srifin_customer_master',
  timestamps: false,
});

module.exports = srifin_customer_master;
  