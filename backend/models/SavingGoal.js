const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavingGoal = sequelize.define('saving_goals', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  target_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  current_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  underscored: true,
  timestamps: true,
  freezeTableName: true,
});

module.exports = SavingGoal;
