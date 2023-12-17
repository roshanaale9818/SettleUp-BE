const config = require('../config/db.config');
const UserModel = require('../models/user.model');
const RoleModel = require('../models/role.model');
const SocialMediaModel = require('../models/socialmedia.model');
const SkillModel = require('../models/skill.model');
const ContactModel = require('../models/contact.model');
const PersonalInfoModel = require('./personalinfo.model');
const ProjectModel=require('./project.model');
const HomeModel = require('./home.model');
const ImageUploadModel = require('./image-upload.model');

const Sequelize = require('sequelize');
const UploadResumeModel = require('./upload.resume.model');
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

// db.user = require('../models/user.model')(sequelize,Sequelize);
// db.role = require('../models/role.model')(sequelize,Sequelize);
db.user = UserModel(sequelize, Sequelize);
db.role = RoleModel(sequelize, Sequelize);
db.contact = ContactModel(sequelize,Sequelize);
// db.personalInfo = PersonalInfoModel(sequelize,Sequelize);
// db.socialMedia = SocialMediaModel(sequelize,Sequelize);
// db.skill = SkillModel(sequelize,Sequelize);
// db.project = ProjectModel(sequelize,Sequelize);
// db.home = HomeModel(sequelize,Sequelize);
db.imageupload = ImageUploadModel(sequelize,Sequelize);
// db.uploadResume = UploadResumeModel(sequelize,Sequelize);

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

// db.translation.belongsTo(db.user);  

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
