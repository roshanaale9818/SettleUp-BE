// association for expense to settlement
// one expense can have one settlement
const Sequelize = require("sequelize");
module.exports = (sequelize) => {
  const ExpenseSettlement = sequelize.define("expenseSettlement", {
    expenseId: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "ExpenseId is required.",
        },
        notNull: {
          msg: "ExpenseId cannot be null",
        },
      },
    },
    settlementId: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Settlement Id is required.",
        },
        notNull: {
          msg: "Settlement Id cannot be null",
        },
      },
    },
  });

  return ExpenseSettlement;
};
