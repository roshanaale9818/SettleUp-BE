// association for expense to settlement
// one expense can have one settlement
const Sequelize = require("sequelize");
module.exports = (sequelize) => {
  const MemberAccount = sequelize.define("memberAccount", {
    memberId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "groupID is required.",
        },
        notNull: {
          msg: "groupID cannot be null",
        },
      },
    },
    settlementId: {
      type: Sequelize.INTEGER,
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

  return MemberAccount;
};
