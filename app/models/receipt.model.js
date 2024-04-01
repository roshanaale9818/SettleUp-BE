const Sequelize = require('sequelize');
module.exports =  (sequelize) => {
    const Receipt =  sequelize.define("Receipt", {
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
      imgUrl: {
        type: Sequelize.STRING,
        allowNull:true
      },
      remarks: {
        type: Sequelize.STRING,
        allowNull:true
      },
      expenseTitle: {
        type: Sequelize.STRING,
        allowNull:true
      }
    },{
        tableName:'receipts'
    });
  
  return Receipt;
  };