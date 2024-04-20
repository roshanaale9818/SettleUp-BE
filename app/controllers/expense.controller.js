const db = require('../models');
const delay = require('../util/helper');
const { getResponseBody } = require('../util/util');
const Expense = db.expense;
const sequelize = db.sequelize;
const Sequelize = require('sequelize')
const Member = db.member;
const Group = db.group;
const User = db.user;
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
      verifiedBy: '0', 
      groupId: body.group,
      memberId:body.paidBy
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
    // const memberIsSet = await expense.setMember(member,{ transaction: t });
    // console.log(memberIsSet);

    // console.log('Transaction state:', t.finished);
    // Commit Transaction if not already committed or rolled back
    await t.commit();
    return res.status(200).send(getResponseBody('ok', "Expense added successfully.", []));
  }

  catch (error) {
    console.log(error)
    await t.rollback();
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ status: "error", errors });
    } else {
      return res.status(500).send(getResponseBody('error', error.message, []));
    }
  }
}


exports.getExpenseList = async (req, res) => {
  delay(2000)
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  try {
  // Find all members associated with the given user ID
  const {count,rows} = await Member.findAndCountAll({
    where: { userId: Number(req.userId) }, // Filter by userId
    include: [
      {
        model: Expense, // Include the Expense model to fetch associated expenses
        include: [
          {
            model: Group, // Include the Group model to fetch associated group details
            attributes: ['groupName'] // Specify the attributes to retrieve (e.g., groupName)
          }
        ],
        required: true // Use inner join to only include members with associated expenses
      }
    ],
    limit,
    offset: (page - 1) * limit,
  });
  const members = rows;

  // Extract expenses and associated group names from the retrieved members
  const expensesWithGroupNames = members.reduce((acc, member) => {
    // Extract expenses associated with the current member
    const memberExpenses = member.Expenses || [];
    // Map each expense to include the associated group name
    const expensesWithGroupName = memberExpenses.map(expense => ({
      ...expense.toJSON(), // Convert Sequelize instance to plain JSON object
      groupName: expense.Group ? expense.Group.groupName : null // Retrieve groupName if available
    }));
    // Concatenate the current member's expenses with group names to the accumulator array
    return acc.concat(expensesWithGroupName);
  }, []);

  // Handle the case where no expenses are found for the user
  if (!expensesWithGroupNames || expensesWithGroupNames.length === 0) {
    return res.status(200).json({
      status: 'ok',
      message: 'No expenses found for this user',
      data: []
    });
  }

  // Handle success scenario
  return res.status(200).json({
    status: "ok",
    message: 'Expenses retrieved successfully for the user with group names',
    data: expensesWithGroupNames,
    totalItems:count ? count:0,
    currentPage:page?page:1,
    totalPages: Math.ceil(count / limit),

  });
} catch (error) {
  // Handle errors
  console.error('Error retrieving expenses for user:', error.message);
  return res.status(500).json({
    status: "error",
    message: 'Failed to retrieve expenses for user',
    error: error.message
  });
}};


exports.getAllExpenseList = async (req,res)=>{
  const userId = req.userId;
  try {
    // Find all groups where the user is a member
    const userGroups = await Group.findAll({
      include: [
        {
          model: Member,
          where: { userId: userId }
        }
      ]
    });

    // Extract group IDs from the user's groups
    const groupIds = userGroups.map(group => group.id);
    // Find all expenses associated with members of the user's groups (excluding the user's own expenses)
    const expenses = await Expense.findAll({
      include: [
        {
          model: Member,
          where: {
            // GroupId: groupIds,
            userId: { [Sequelize.Op.ne]: userId } // Exclude expenses added by the user
          },
          include: [
            // { model: User }, // Include the user who added the expense
            { model: Group, 
              where:{
                  id:groupIds
              },
              attributes: ['groupName'] } // Include the group details
          ]
        }
      ]
    });

    // Handle the case where no expenses are found
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No expenses found for other users in your groups',
        data: []
      });
    }

    // Format the response to include relevant details
    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      addedBy: expense.Member.User.username, // Assuming there's a username attribute in the User model
      groupName: expense.Member.Group.groupName
    }));

    // Return the list of expenses associated with other users in your groups
    return res.status(200).json({
      status: 'success',
      message: 'Expenses retrieved successfully for other users in your groups',
      data: formattedExpenses
    });

  } catch (error) {
    // Handle errors
    console.error('Error retrieving expenses for other users:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve expenses for other users',
      error: error.message
    });
  }
}

