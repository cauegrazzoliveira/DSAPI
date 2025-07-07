const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const AnalysisResult = sequelize.define('AnalysisResult', {
  columnName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mean: DataTypes.FLOAT,
  median: DataTypes.FLOAT,
  min: DataTypes.FLOAT,
  max: DataTypes.FLOAT,
  std: DataTypes.FLOAT,
  sum: DataTypes.FLOAT
});

module.exports = AnalysisResult;