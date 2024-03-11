const Sequelize = require('sequelize');
module.exports =  (sequelize) => {
    const Token =  sequelize.define("token", { 
      token: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        unique: true,
        validate:{
          notEmpty:{
            msg:"Token is required."
          },
          notNull:{
            msg:'Token cannot be null'
          }
        }
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"CreatedBy is required."
          },
          notNull:{
            msg:'CreatedBy cannot be null'
          }
        }
      }
    });
  
  return Token;
  };