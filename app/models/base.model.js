const { Model, DataTypes } = require('sequelize');
// const sequelize = new Sequelize(
//     config.development.database,
//     config.development.username,
//     config.development.password,
//     {
//       host: config.development.host,
//       dialect: config.development.dialect,
//     }
//   );
  
//   module.exports = sequelize;
const sequelize = require('./db');

class BaseModel extends Model {

  static initModel(attributes, options) {
    return super.init(attributes, {
      sequelize,
      ...options,
    });
  }

  // Add any common methods or configurations here
}

module.exports = BaseModel;
