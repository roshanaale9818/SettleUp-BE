const Sequelize = require('sequelize');
module.exports =  (sequelize) => {
    const Group =  sequelize.define("Group", { 
      groupName: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"Name is required."
          },
          notNull:{
            msg:'Name cannot be null'
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
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"Status is required."
          },
          notNull:{
            msg:'Status cannot be null'
          }
        }
      },
      remarks: {
        type: Sequelize.STRING,
        allowNull:true
      },
      imgUrl: {
        type: Sequelize.STRING,
        allowNull:true
      }
    },{
        tableName:'groups'
    });
  
  return Group;
  };