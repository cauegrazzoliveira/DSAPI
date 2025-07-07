const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const Upload = sequelize.define('Upload', {
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Upload;