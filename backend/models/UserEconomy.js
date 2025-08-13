// models/UserEconomy.js
module.exports = (sequelize, DataTypes) => {
  const UserEconomy = sequelize.define('UserEconomy', {
    userId: DataTypes.INTEGER,
    gold_amount: DataTypes.INTEGER,
  });
  return UserEconomy;
};
