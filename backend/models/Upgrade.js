// models/Upgrade.js
module.exports = (sequelize, DataTypes) => {
  const Upgrade = sequelize.define('Upgrade', {
    userId: DataTypes.INTEGER,
    upgradeId: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    status: DataTypes.STRING,
    startedAt: DataTypes.DATE,
    finishAt: DataTypes.DATE,
  });
  return Upgrade;
};

// models/UserEconomy.js
module.exports = (sequelize, DataTypes) => {
  const UserEconomy = sequelize.define('UserEconomy', {
    userId: DataTypes.INTEGER,
    gold_amount: DataTypes.INTEGER,
    // other economy fields
  });
  return UserEconomy;
};
