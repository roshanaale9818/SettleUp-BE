const Sequelize = require('sequelize');
module.exports =  (sequelize) => {
    const ExpenseReceipt =  sequelize.define("ExpenseReceipt", { 
      ExpenseId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"ExpenseId is required."
          },
          notNull:{
            msg:'ExpenseId cannot be null'
          }
        }
      },
      ReceiptId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          notEmpty:{
            msg:"Receipt Id is required."
          },
          notNull:{
            msg:'Receipt Id cannot be null'
          }
        }
      }
    });
  
  return ExpenseReceipt;
  };