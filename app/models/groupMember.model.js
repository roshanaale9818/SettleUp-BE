const Sequelize = require('sequelize');
module.exports =  (sequelize) => {
    const GroupMember =  sequelize.define("GroupMember", { 
      GroupId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"GroupId is required."
          },
          notNull:{
            msg:'GroupId cannot be null'
          }
        }
      },
      MemberId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"MemberId is required."
          },
          notNull:{
            msg:'MemberId cannot be null'
          }
        }
      }
    });
  
  return GroupMember;
  };