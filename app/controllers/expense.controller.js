const db = require('../models');
const { getResponseBody } = require('../util/util');
const Expense = db.expense;
const sequelize = db.sequelize;
const Member = db.member;
const Group = db.group;
exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { body } = req;
    let expenseDataObj = {
      ...body,
      settlementStatus: 'PENDING',
      title: body.expenseTitle,
      status: '1',
      isVerified: '0',
      verifiedBy: '0', // No need to wrap null in quotes
      groupId: body.group
    }
    // 1. Create Expense
    const expense = await Expense.create(expenseDataObj, { transaction: t });

    // 2. Add Expense to Group
    const group = await Group.findOne({ where: { id: parseInt(body.group) }, transaction: t });
    if (!group) throw new Error('Group not found');
    await expense.setGroup(group, { transaction: t });

    // 3. Add Expense to Member
    const member = await Member.findOne({ where: { id: parseInt(body.paidBy) }, transaction: t });
    if (!member) throw new Error('Member not found');
    await member.addExpense(expense, { transaction: t });

    // console.log('Transaction state:', t.finished);
    // Commit Transaction if not already committed or rolled back
    await t.commit();
    return res.status(200).send(getResponseBody('ok', "Expense added successfully.", []));
  }

  catch (error) {
    await t.rollback();
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ status: "error", errors });
    } else {
      return res.status(500).send(getResponseBody('error', error.message, []));
    }
  }
}
