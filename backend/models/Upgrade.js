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

