const config = require('../config/db.config');
const UserModel = require('../models/user.model');
const RoleModel = require('../models/role.model');
const TokenModel = require('./token.model');
const Sequelize = require('sequelize');
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
      ssl:true
    }
  }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = UserModel(sequelize,Sequelize);
db.role = RoleModel(sequelize, Sequelize);
db.token = TokenModel(sequelize);
// through, foreignKey, otherKey, is for a new table user_roles as 
// connection between users and roles table via their primary key as foreign keys.
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});
 

db.ROLES = ["user", "admin", "moderator","superadmin"];
module.exports = db;
