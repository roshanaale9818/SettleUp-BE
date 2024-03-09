const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

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
