const Sequelize = require('sequelize');
module.exports =  (sequelize) => {
    const MemberExpense =  sequelize.define("memberexpense", { 
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
  
  return MemberExpense;
  };