const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('categories', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('expense', 'income'),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6366f1',
  },
}, {
  timestamps: false,
  freezeTableName: true,
});

module.exports = Category;
