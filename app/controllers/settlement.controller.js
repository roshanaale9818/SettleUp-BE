const db = require("../models");
const delay = require("../util/helper");
const { getResponseBody, SETTLEMENT_STATUS } = require("../util/util");
const Expense = db.expense;
const sequelize = db.sequelize;
const Sequelize = require("sequelize");
const Member = db.member;
const Group = db.group;
const User = db.user;
exports.createSettlement = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { body } = req;
    const { groupId } = req.query;
    if (!groupId) throw new Error("Group id cannot be null");

    let expenseDataObj = {
      ...body,
      settlementStatus: SETTLEMENT_STATUS.PENDING,
      title: body.expenseTitle,
      status: "1",
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

exports.getSettlementList = async (req, res) => {
  delay(2000);
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  try {
    // Find all members associated with the given user ID
    const { count, rows } = await Member.findAndCountAll({
      where: { userId: Number(req.userId) }, // Filter by userId
      include: [
        {
          model: Expense, // Include the Expense model to fetch associated expenses
          include: [
            {
              model: Group, // Include the Group model to fetch associated group details
              attributes: ["groupName"], // Specify the attributes to retrieve (e.g., groupName)
            },
          ],
          required: true, // Use inner join to only include members with associated expenses
        },
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
      const expensesWithGroupName = memberExpenses.map((expense) => ({
        ...expense.toJSON(), // Convert Sequelize instance to plain JSON object
        groupName: expense.Group ? expense.Group.groupName : null, // Retrieve groupName if available
      }));
      // Concatenate the current member's expenses with group names to the accumulator array
      return acc.concat(expensesWithGroupName);
    }, []);

    // Handle the case where no expenses are found for the user
    if (!expensesWithGroupNames || expensesWithGroupNames.length === 0) {
      return res.status(200).json({
        status: "ok",
        message: "No expenses found for this user",
        data: [],
      });
    }

    // Handle success scenario
    return res.status(200).json({
      status: "ok",
      message: "Expenses retrieved successfull for the user with group names",
      data: expensesWithGroupNames,
      totalItems: count ? count : 0,
      currentPage: page ? page : 1,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving expenses for user:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve expenses for user",
      error: error.message,
    });
  }
};

// all expenses
exports.getSettlementDetail = async (req, res) => {
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
      status: "1",
      isVerified: "0",
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
    where: {
      id: body.id;
    }
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

// get expense preview

exports.getAcceptedExpenses = async (req, res) => {
  const userId = req.userId;
  const { groupId } = req.query;
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 100; // Default page size

  try {
    if (!groupId) throw new Error("Group Id is required.");

    const offset = (page - 1) * pageSize;

    const expenses = await Expense.findAndCountAll({
      where: {
        groupId: groupId,
        status: SETTLEMENT_STATUS.ACCEPTED,
      },
      include: [
        {
          model: Member,
        },
        { model: User },
      ],
      limit: pageSize,
      offset: offset,
    });

    // the case where no expenses are found
    if (!expenses || expenses.count === 0) {
      return res.status(200).json({
        status: "error",
        message: "No expenses found for other users in your groups",
        data: [],
      });
    }

    // Return the list of expenses associated with other users in your groups
    return res.status(200).json({
      status: "ok",
      message: "Expenses retrieved successfull.",
      data: expenses.rows,
      totalItems: expenses.count,
      totalPages: Math.ceil(expenses.count / pageSize),
      currentPage: page,
    });
  } catch (error) {
    // Handle errors
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve expenses",
      error: error.message,
    });
  }
};

// get group list with members with the token and user
exports.getAdminGroups = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  try {
    const { count, rows } = await Group.findAndCountAll({
      include: [
        {
          model: Member,
          where: {
            userId: String(req.userId),
            isAdmin: "1",
          },
          attributes: {
            exclude: ["group_members"],
          },
        },
      ],
      where: {
        status: "1",
      },
      limit,
      offset: (page - 1) * limit,
      raw: true,
      attributes: {
        exclude: [""],
      },
    });

    const dataRows = rows.map((group) => ({
      id: group.id,
      imgUrl: group.imgUrl,
      groupName: group.groupName,
      status: group.status,
      remarks: group.remarks,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      isAdmin: group["Members.isAdmin"], // Access isAdmin directly from the flattened structure
    }));

    res.status(200).json({
      status: "ok",
      totalItems: count ? count : 0,
      data: dataRows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send(getResponseBody("error", error.message, []));
  }
};
