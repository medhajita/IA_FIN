const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Transaction = require('./Transaction');
const SavingGoal = require('./SavingGoal');
const Recommendation = require('./Recommendation');

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });
Transaction.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Transaction, { foreignKey: 'category_id' });
User.hasMany(SavingGoal, { foreignKey: 'user_id' });
SavingGoal.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Recommendation, { foreignKey: 'user_id' });
Recommendation.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Category, Transaction, SavingGoal, Recommendation };
