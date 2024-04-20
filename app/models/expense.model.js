const Sequelize = require('sequelize');
module.exports =  (sequelize) => {
    const Expense =  sequelize.define("Expense", { 
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"Title is required."
          },
          notNull:{
            msg:'Title cannot be null'
          }
        }
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"Expense Amount is required."
          },
          notNull:{
            msg:'Expense Amount cannot be null'
          }
        }
      },
      groupId: {
        type: Sequelize.INTEGER,
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
      settlementStatus: {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"Description is required."
          },
          notNull:{
            msg:'Description cannot be null'
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
      isVerified: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"Verified is required."
          },
          notNull:{
            msg:'Verified cannot be null'
          }
        }
      },
      verifiedBy: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"Verified By is required."
          },
          notNull:{
            msg:'Verified By cannot be null'
          }
        }
      },
      // MemberId:{
      //   type: Sequelize.STRING,
      //   allowNull: false,
      //   validate:{
      //     notEmpty:{
      //       msg:"CreatedBy  is required."
      //     },
      //     notNull:{
      //       msg:'Created By cannot be null'
      //     }
      //   }
      // }
      
    },{
        tableName:'expense'
    });
  
  return Expense;
  };