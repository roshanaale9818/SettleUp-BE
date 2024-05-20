// Settlement model
const Sequelize = require("sequelize");
module.exports = (sequelize) => {
  const Settlement = sequelize.define(
    "settlement",
    {
      title: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title is required.",
          },
          notNull: {
            msg: "Title cannot be null",
          },
        },
      },
      settledBy: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Settled By is required.",
          },
          notNull: {
            msg: "Settled By cannot be null",
          },
        },
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Status is required.",
          },
          notNull: {
            msg: "Status cannot be null",
          },
        },
      },
      remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      totalAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Amount is required.",
          },
          notNull: {
            msg: "Amount cannot be null",
          },
        },
      },
    },
    {
      tableName: "settlement",
    }
  );

  return Settlement;
};
