const Sequelize = require("sequelize");
module.exports = (sequelize) => {
  const Balance = sequelize.define("accountBalance", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    balance: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    last_updated: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    settlementId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    isSettled: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });
  return Balance;
};
