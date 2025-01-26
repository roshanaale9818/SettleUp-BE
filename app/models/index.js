const config = require("../config/db.config");
const UserModel = require("../models/user.model");
const RoleModel = require("../models/role.model");
const TokenModel = require("./token.model");
const GroupModel = require("./group.model");
const InvitationModel = require("./invitation.model");
// const GroupMemberModel = require('./groupmember.model');
const MemberModel = require("./member.model");
const GroupMemberModel = require("./groupMember.model");
const ExpenseModel = require("./expense.model");
const ReceiptModel = require("./receipt.model");
const GroupExpense = require("./groupexpense.model");
const MemberExpense = require("./memberexpense.model");
const ExpenseReceipt = require("./expensereceipt.model");
const SettlementModel = require("./settlement.model");
const ExpenseSettlement = require("./settlementexpense.model");
const GroupSettlement = require("./groupSettlement.model");
const Sequelize = require("sequelize");
const Balance = require("./accountBalance.model");
const MemberAccount = require("./memberAccount.model");
const PasswordResetToken = require("./passwordResetToken.model");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,

  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: 0,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle,
      ssl: true,
    },
  }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = UserModel(sequelize, Sequelize);
db.role = RoleModel(sequelize, Sequelize);
db.token = TokenModel(sequelize);
// db.groupMember = GroupMemberModel(sequelize);
db.group = GroupModel(sequelize);
db.member = MemberModel(sequelize);
db.invitation = InvitationModel(sequelize);
db.groupMember = GroupMemberModel(sequelize);
db.expense = ExpenseModel(sequelize);
db.receipt = ReceiptModel(sequelize);
db.memberExpense = MemberExpense(sequelize);
db.groupExpense = GroupExpense(sequelize);
db.expenseReceipt = ExpenseReceipt(sequelize);

// expense and settlement association table
db.expenseSettlement = ExpenseSettlement(sequelize);
db.settlement = SettlementModel(sequelize);
db.groupSettement = GroupSettlement(sequelize);

db.accountBalance = Balance(sequelize);
db.memberAccount = MemberAccount(sequelize);
db.passwordResetToken = PasswordResetToken(sequelize);

// association between entities
// through, foreignKey, otherKey, is for a new table user_roles as
// connection between users and roles table via their primary key as foreign keys.
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId",
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId",
});
//association a group has many members
db.group.belongsToMany(db.member, {
  through: db.groupMember,
});
db.member.belongsToMany(db.group, {
  through: db.groupMember,
});
db.expense.belongsTo(db.group, {
  foreignKey: "group_id",
  through: db.groupExpense,
}); // Each expense belongs to one group
db.group.belongsToMany(db.expense, {
  foreignKey: "group_id",
  through: db.groupExpense,
});
db.member.belongsToMany(db.expense, {
  through: db.memberExpense,
});
db.expense.belongsTo(db.member, { through: db.memberExpense });
db.expense.belongsToMany(db.receipt, {
  foreignKey: "receipt_id",
  through: db.expenseReceipt,
});
db.expense.belongsTo(db.settlement);
db.user.hasMany(db.member);
db.member.belongsTo(db.user);

//association a settlement has many expenses
db.settlement.belongsToMany(db.expense, {
  through: db.expenseSettlement,
});
db.settlement.belongsToMany(db.member, {
  through: db.memberAccount,
});

db.group.hasMany(db.settlement);
db.settlement.hasMany(db.accountBalance);
db.expense.belongsTo(db.user, { foreignKey: "verifiedBy" });

// // Group-Settlement Association (One-to-Many)
// db.group.hasMany(db.settlement, { foreignKey: "groupId" });
// db.settlement.belongsTo(db.group, { foreignKey: "groupId" });

db.ROLES = ["user", "admin", "moderator", "superadmin"];
module.exports = db;
