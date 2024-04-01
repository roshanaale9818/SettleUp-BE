const Sequelize = require('sequelize');
module.exports =  (sequelize) => {
    const GroupExpense =  sequelize.define("GroupExpense", { 
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
      }
    });
  
  return GroupExpense;
  };