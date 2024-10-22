const { v4: uuidv4 } = require("uuid");
const db = require("../models");
const { Op } = require("sequelize");
const PasswordResetToken = db.passwordResetToken;
const bcrypt = require("bcryptjs");
const User = db.user;

const requestPasswordReset = async (email) => {
  // Generate a UUID token
  const token = uuidv4();

  // Set expiration time (1 hour from now)
  const expiresAt = new Date(Date.now() + 14400000);

  // Store token, email, and expiration in the PasswordResetToken table
  await PasswordResetToken.upsert({
    email,
    token,
    expiresAt,
  });

  // Send reset email with token
  return token;
};
const changePassword = async (token, password) => {
  console.log(token);
  // Find the token in the PasswordResetToken table
  const resetRecord = await PasswordResetToken.findOne({
    where: {
      token,
      expiresAt: {
        [Op.gt]: new Date(), // Ensure the token is not expired
      },
    },
  });
  console.log(resetRecord);

  if (!resetRecord) {
    throw new Error("Invalid or expired reset token");
  }
  const user = await User.findOne({ where: { email: resetRecord.email } });
  if (!user) {
    throw new Error("User not found");
  }
  user.password = bcrypt.hashSync(password, 8);
  await user.save();

  // Remove the token from the PasswordResetToken table
  await PasswordResetToken.destroy({ where: { email: resetRecord.email } });
};
module.exports = { requestPasswordReset, changePassword };
