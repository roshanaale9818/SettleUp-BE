const Sequelize = require("sequelize");
module.exports = (sequelize) => {
  const PasswordResetToken = sequelize.define("PasswordResetToken", {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // Ensure email is unique in this table
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  return PasswordResetToken;
};
