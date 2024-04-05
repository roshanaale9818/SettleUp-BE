const db = require('../models');
const { getResponseBody } = require('../util/util');
const Expense = db.expense;
const sequelize = db.sequelize;
const Member = db.member;
const Group = db.group;
exports.addExpense = async (req, res) => {
    try {
        const {body}= req;
        let expenseDataObj = {
            ...body,
            settlementStatus:'PENDING',
            title:body.expenseTitle,
            status:'1',
            isVerified:'0',
            verifiedBy:'null',
        }
        // console.log(body);
        // const result = await Expense.create({
        //     body
        // });
        // if(!result){
        // return res.status(400).send(getResponseBody('error',"Expense addition failed.",result))
        // }
        // return res.status(200).send(getResponseBody('ok',"Expense added successfull.",result));


        sequelize.transaction(async (t) => {
            try {
              // 4. Create Expense
              const expense = await Expense.create({
                expenseDataObj
              }, { transaction: t });
          
              // 5. Add Expense to Group
              const group = await Group.findOne({ where: { id: parseInt(body.groupId) }, transaction: t });
              if (!group) throw new Error('Group not found');
              await expense.setGroup(group, { transaction: t });
          
              // 6. Add Expense to Member
              const member = await Member.findOne({ where: { id:parseInt(body.memberId)}, transaction: t });
              if (!member) throw new Error('Member not found');
              await expense.addMember(member, { transaction: t });
          
              // 7. Commit Transaction
              await t.commit();
          
              console.log('Expense added to group and member successfully');
              return res.status(200).send(getResponseBody('ok',"Expense added successfull.",[]));
            } catch (error) {
              // 8. Rollback Transaction
              await t.rollback();
              return res.status(500).send(getResponseBody('error', error.message, []));
              console.error('Error adding expense to group and member:', error);
            }
          });
    }
    catch (error) {
        // console.log("errr",err.message)
        if (error.name === 'SequelizeValidationError' || error.name ===
            'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ status: "error", errors });
        }
        else {
            return res.status(500).send(getResponseBody('error', error.message, []));

        }
    }
}