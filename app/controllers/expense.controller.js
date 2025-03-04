const db = require("../models");
const delay = require("../util/helper");
const { getResponseBody, SETTLEMENT_STATUS } = require("../util/util");
const Expense = db.expense;
const sequelize = db.sequelize;
const Sequelize = require("sequelize");
// const nano = require("nanoid");
const Member = db.member;
const Group = db.group;
const User = db.user;
exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { body } = req;
    delete body.id; // delete the id
    let expenseDataObj = {
      ...body,
      settlementStatus: SETTLEMENT_STATUS.PENDING,
      title: body.expenseTitle,
      status: SETTLEMENT_STATUS.PENDING,
      isVerified: "0",
      verifiedBy: 0,
      groupId: body.group,
      MemberId: body.paidBy,
    };
    // 1. Create Expense
    const expense = await Expense.create(expenseDataObj, { transaction: t });

    // 2. Add Expense to Group
    const group = await Group.findOne({
      where: { id: parseInt(body.group) },
      transaction: t,
    });
    if (!group) throw new Error("Group not found");
    await expense.setGroup(group, { transaction: t });

    // 3. Add Expense to Member
    const member = await Member.findOne({
      where: { id: parseInt(body.paidBy) },
      transaction: t,
    });
    if (!member) throw new Error("Member not found");
    await member.addExpense(expense, { transaction: t });

    // Commit Transaction if not already committed or rolled back
    await t.commit();
    return res
      .status(200)
      .send(getResponseBody("ok", "Expense added successfull.", []));
  } catch (error) {
    console.log(error);
    await t.rollback();
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({ status: "error", errors });
    } else {
      return res.status(500).send(getResponseBody("error", error.message, []));
    }
  }
};

// exports.getExpenseList = async (req, res) => {
//   delay(2000);
//   const page = req.query.page ? parseInt(req.query.page) : 1;
//   const limit = req.query.limit ? parseInt(req.query.limit) : 10;

//   try {
//     const { count, rows } = await Member.findAndCountAll({
//       where: { userId: Number(req.userId) },
//       include: [
//         {
//           model: Expense,
//           include: [
//             {
//               model: Group,
//               attributes: ["groupName"],
//             },
//           ],
//           required: true,
//         },
//       ],
//       distinct: true, // Ensures distinct Members in the result set
//       limit,
//       offset: (page - 1) * limit,
//     });

//     // Extract and format expenses with group names
//     const expensesWithGroupNames = rows.flatMap((member) =>
//       (member.Expenses || []).map((expense) => ({
//         ...expense.toJSON(),
//         groupName: expense.Group ? expense.Group.groupName : null,
//       }))
//     );

//     if (!expensesWithGroupNames.length) {
//       return res.status(200).json({
//         status: "ok",
//         message: "No expenses found for this user",
//         data: [],
//       });
//     }

//     return res.status(200).json({
//       status: "ok",
//       message: "Expenses retrieved successfully for the user with group names",
//       data: expensesWithGroupNames,
//       totalItems: count || 0,
//       currentPage: page,
//       totalPages: Math.ceil(count / limit),
//     });
//   } catch (error) {
//     console.error("Error retrieving expenses for user:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve expenses for user",
//       error: error.message,
//     });
//   }
// };

exports.getExpenseList = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  // Get optional filters from query params
  const groupId = req.query.groupId ? parseInt(req.query.groupId) : null;
  const status = req.query.status ? req.query.status : null;

  try {
    const { count, rows } = await Member.findAndCountAll({
      where: { userId: Number(req.userId) },
      include: [
        {
          model: Expense,
          where: {
            ...(status && { status }), // Apply status filter if provided
          },
          include: [
            {
              model: Group,
              attributes: ["id", "groupName"],
              where: {
                ...(groupId && { id: groupId }), // Apply group filter if provided
              },
              required: false, // Allows expenses without a group to still show up
            },
          ],
          required: true,
        },
      ],
      distinct: true, // Ensures distinct Members in the result set
      limit,
      offset: (page - 1) * limit,
    });

    // Extract and format expenses with group names
    const expensesWithGroupNames = rows.flatMap((member) =>
      (member.Expenses || []).map((expense) => ({
        ...expense.toJSON(),
        groupName: expense.Group ? expense.Group.groupName : null,
        groupId: expense.Group ? expense.Group.id : null,
      }))
    );

    if (!expensesWithGroupNames.length) {
      return res.status(200).json({
        status: "ok",
        message: "No expenses found for this user",
        data: [],
      });
    }

    return res.status(200).json({
      status: "ok",
      message: "Expenses retrieved successfully for the user with group names",
      data: expensesWithGroupNames,
      totalItems: count || 0,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error retrieving expenses for user:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve expenses for user",
      error: error.message,
    });
  }
};

// all expenses
exports.getAllExpenseList = async (req, res) => {
  const userId = req.userId;
  try {
    // Find all groups where the user is a member
    const userGroups = await Group.findAll({
      include: [
        {
          model: Member,
          where: { userId: userId },
        },
      ],
    });

    // Extract group IDs from the user's groups
    const groupIds = userGroups.map((group) => group.id);
    // Find all expenses associated with members of the user's groups (excluding the user's own expenses)
    const expenses = await Expense.findAll({
      include: [
        {
          model: Member,
          where: {
            // GroupId: groupIds,
            userId: { [Sequelize.Op.ne]: userId }, // Exclude expenses added by the user
          },
          include: [
            // { model: User }, // Include the user who added the expense
            {
              model: Group,
              where: {
                id: groupIds,
              },
              attributes: ["groupName"],
            }, // Include the group details
          ],
        },
      ],
    });

    // Handle the case where no expenses are found
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No expenses found for other users in your groups",
        data: [],
      });
    }

    // Format the response to include relevant details
    const formattedExpenses = expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      addedBy: expense.Member.User.username, // Assuming there's a username attribute in the User model
      groupName: expense.Member.Group.groupName,
    }));

    // Return the list of expenses associated with other users in your groups
    return res.status(200).json({
      status: "success",
      message: "Expenses retrieved successfull for other users in your groups",
      data: formattedExpenses,
    });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving expenses for other users:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve expenses for other users",
      error: error.message,
    });
  }
};

exports.updateExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { body } = req;
    // Check if the provided ID exists in the database
    const existingExpense = await Expense.findOne({ where: { id: body.id } });
    if (!existingExpense) {
      throw new Error("Expense not found");
    }

    const existingGroup = await Group.findOne(
      {
        where: {
          id: body.group,
        },
      },
      { transaction: t }
    );

    let expenseDataObj = {
      ...body,
      settlementStatus: SETTLEMENT_STATUS.PENDING,
      title: body.expenseTitle,
      // status: body.status,
      isVerified: body.isVerified ? "1" : "0",
      verifiedBy: 0,
      groupId: body.group,
      MemberId: body.paidBy,
    };

    await Expense.update(expenseDataObj, {
      transaction: t,
      where: {
        id: body.id ?? "",
      },
    });
    const expense = await Expense.findOne({});

    // Update associations
    await expense.setGroup(existingGroup, { transaction: t });
    const member = await Member.findOne({
      where: { id: parseInt(body.paidBy) },
      transaction: t,
    });
    if (!member) throw new Error("Member not found");
    await member.addExpense(expense, { transaction: t });

    // Commit Transaction if not already committed or rolled back
    await t.commit();
    return res
      .status(200)
      .send(getResponseBody("ok", "Expense updated successfull.", []));
  } catch (error) {
    console.log(error);
    await t.rollback();
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({ status: "error", errors });
    } else {
      return res.status(500).send(getResponseBody("error", error.message, []));
    }
  }
};

// delete the expense
exports.deleteExpense = async (req, res) => {
  try {
    //get the user id from request
    // const userId = req.userId;
    const { expenseId } = req.body;
    if (!expenseId) throw new Error("Expense is required");
    // get the expense related to that group
    const expense = await Expense.findOne({
      where: {
        id: expenseId ?? "",
      },
    });
    // console.log("expense found",expense);
    if (!expense) throw new Error(`Expense cannot be found for ${expenseId}`);
    if (expense.settlementStatus.toLowerCase() === "settled") {
      return res
        .status(403)
        .json(getResponseBody("error", "Settled amount cannot be deleted."));
    }
    // delete the expense
    const result = await Expense.destroy({
      where: {
        id: expenseId,
      },
    });
    if (!result) throw new Error("Error in deleting expense");
    // update the expense
    return res
      .status(200)
      .json(getResponseBody("ok", "Expense update success."));
  } catch (err) {
    return res.status(400).json(getResponseBody("error", err.message));
  }
};

// get all pending requests for the admin
exports.getExpenseRequest = async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 10 } = req.query;
  try {
    // Find all groups where the user is a Admin
    const userGroups = await Group.findAll({
      include: [
        {
          model: Member,
          where: { userId: userId, isAdmin: "1" },
        },
      ],
      where: {
        status: "1",
      },
    });

    // Extract group IDs from the user's groups
    const groupIds = userGroups.map((group) => group.id);

    // Find the total count of expenses associated with members of the user's groups
    const totalCount = await Expense.count({
      include: [
        {
          model: Member,
          include: [
            {
              model: Group,
              where: {
                id: groupIds,
              },
              attributes: [],
            },
          ],
        },
      ],
      where: {
        settlementStatus: SETTLEMENT_STATUS.PENDING,
      },
    });

    // Find all expenses associated with members of the user's groups (excluding the user's own expenses)
    const expenses = await Expense.findAll({
      include: [
        {
          model: Member,
          include: [
            // { model: User }, // Include the user who added the expense
            {
              model: Group,
              where: {
                id: groupIds,
              },
              attributes: ["groupName"],
            }, // Include the group details
          ],
        },
      ],
      where: {
        status: SETTLEMENT_STATUS.PENDING,
      },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    // Handle the case where no expenses are found
    if (!expenses || expenses.length === 0) {
      return res.status(200).json({
        status: "ok",
        message: "No expenses found for other users in groups",
        data: [],
      });
    }
    // Format the response to include relevant details
    const formattedExpenses = expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      addedBy: expense.Member.memberName, // Assuming there's a username attribute in the User model
      groupName: expense.Member.Groups[0].groupName,
      createdAt: expense.createdAt,
      isVerified: expense.isVerified,
      verifiedBy: expense.verifiedBy,
      updatedAt: expense.updatedAt,
      description: expense.description,
      createdBy: expense.Member.userId,
      groupId: expense.Member.Groups[0].GroupMember.GroupId,
      status: expense.status,
    }));

    // Return the list of expenses
    return res.status(200).json({
      status: "ok",
      message: "Expenses retrieved successfull",
      data: formattedExpenses,
      totalItems: totalCount ? totalCount : 0,
      currentPage: page ? page : 1,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving expenses for other users:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve expenses for other users",
      error: error.message,
      totalItems: 0,
    });
  }
};

// update expense Request
exports.updateExpenseRequest = async (req, res) => {
  const { body: expenseBody } = req;
  const userId = req.userId;
  try {
    const { id } = expenseBody;
    if (!id) throw new Error("Expense id cannot be found on payload.");
    const expense = await Expense.findOne({
      where: {
        id: expenseBody.id,
      },
    });
    if (!expense) throw new Error("Expense cannot be found.");
    // if expense is found update the expense
    const result = await Expense.update(
      {
        status: expenseBody.status,
        isVerified: "1",
        verifiedBy: userId,
      },
      {
        where: {
          id: id,
        },
      }
    );
    if (!result) throw new Error("Something went wrong while saving");
    return res
      .status(200)
      .json(getResponseBody("ok", "Expense saved successfull."));
  } catch (error) {
    return res.status(500).json(getResponseBody("error", error.message));
  }
};
