// // const isRequiredMessage = require("../util/validateRequest");
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", { 
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,

    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,

    }
  });

return User;
};


// const { DataTypes } = require('sequelize');
// const BaseModel = require('./base.model');
// BaseModel

// class User extends BaseModel {
//   static init(attributes, options) {
//     const modelAttributes = {
//       username: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//       },
//       // Add more attributes as needed
//     };

//     return super.initModel(modelAttributes, {
//       ...options,
//       modelName: 'User', // This is the name of the table in the database
//     });
//   }
// }

// module.exports = User;