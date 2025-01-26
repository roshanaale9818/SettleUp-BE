const db = require("../models");
const delay = require("../util/helper");
const { getResponseBody, SETTLEMENT_STATUS } = require("../util/util");
const Expense = db.expense;
const sequelize = db.sequelize;
const Sequelize = require("sequelize");
const { getMembers } = require("./group.controller");
const Member = db.member;
const Group = db.group;
const User = db.user;
const Settlement = db.settlement;
const { v4: uuidv4 } = require("uuid");
const ExpenseSettlement = db.expenseSettlement;
const GroupSettlement = db.groupSettement;

// exports.createSettlement = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { body } = req;
//     const { groupId } = req.query;
//     if (!groupId) throw new Error("Group id cannot be null");

//     let expenseDataObj = {
//       ...body,
//       settlementStatus: SETTLEMENT_STATUS.PENDING,
//       title: body.expenseTitle,
//       status: "1",
//       isVerified: "0",
//       verifiedBy: 0,
//       groupId: body.group,
//       MemberId: body.paidBy,
//     };
//     // 1. Create Expense
//     const expense = await Expense.create(expenseDataObj, { transaction: t });

//     // 2. Add Expense to Group
//     const group = await Group.findOne({
//       where: { id: parseInt(body.group) },
//       transaction: t,
//     });
//     if (!group) throw new Error("Group not found");
//     await expense.setGroup(group, { transaction: t });

//     // 3. Add Expense to Member
//     const member = await Member.findOne({
//       where: { id: parseInt(body.paidBy) },
//       transaction: t,
//     });
//     if (!member) throw new Error("Member not found");
//     await member.addExpense(expense, { transaction: t });
//     // Commit Transaction if not already committed or rolled back
//     await t.commit();
//     return res
//       .status(200)
//       .send(getResponseBody("ok", "Expense added successfull.", []));
//   } catch (error) {
//     console.log(error);
//     await t.rollback();
//     if (
//       error.name === "SequelizeValidationError" ||
//       error.name === "SequelizeUniqueConstraintError"
//     ) {
//       const errors = error.errors.map((err) => err.message);
//       return res.status(400).json({ status: "error", errors });
//     } else {
//       return res.status(500).send(getResponseBody("error", error.message, []));
//     }
//   }
// };

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
      return res.status(200).json({
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

// get expense preview for any group

// exports.getAcceptedExpenses = async (req, res) => {
//   const userId = req.userId;
//   const { groupId } = req.query;
//   const page = parseInt(req.query.page) || 1;
//   const pageSize = Math.min(parseInt(req.query.limit) || 100, 1000);

//   try {
//     if (!groupId) {
//       return res
//         .status(422)
//         .json({ status: "error", message: "Group Id is required." });
//     }

//     const parsedGroupId = parseInt(groupId, 10);
//     if (isNaN(parsedGroupId)) {
//       return res
//         .status(422)
//         .json({ status: "error", message: "Invalid Group Id." });
//     }

//     const offset = (page - 1) * pageSize;
//     const expenses = await Expense.findAndCountAll({
//       where: {
//         groupId: parsedGroupId,
//         status: SETTLEMENT_STATUS.ACCEPTED,
//         isVerified: "1",
//       },
//       include: [
//         {
//           model: Member,
//           include: [
//             {
//               model: User,
//               attributes: {
//                 exclude: [
//                   "password",
//                   "isAdmin",
//                   "country",
//                   "postalCode",
//                   "street",
//                   "imgUrl",
//                   "isVerified",
//                   "status",
//                   "createdAt",
//                   "updatedAt",
//                   "remarks",
//                   "contact",
//                 ],
//               },
//             },
//           ],
//           attributes: { exclude: ["isAdmin", "createdAt", "updatedAt"] },
//         },
//         { model: Group },
//       ],
//       attributes: { exclude: ["isAdmin", "updatedAt"] },
//       limit: pageSize,
//       offset: offset,
//     });

//     if (!expenses || expenses.count === 0) {
//       return res.status(200).json({
//         status: "error",
//         message: `No expenses found.`,
//         data: [],
//       });
//     }

//     // Rename 'user' to 'userDetails' in the response
//     const transformedExpenses = await transformExpenses(expenses.rows);
//     return res.status(200).json({
//       status: "ok",
//       message: `Expenses retrieved successfully.`,
//       data: transformedExpenses,
//       totalItems: expenses.count,
//       totalPages: Math.ceil(expenses.count / pageSize),
//       currentPage: page,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve expenses.",
//       error: error.message,
//     });
//   }
// };

// Controller to get accepted expenses
exports.getAcceptedExpenses = async (req, res) => {
  const userId = req.userId; // The ID of the current user
  const { groupId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.limit) || 100, 1000);

  try {
    // Validate groupId
    if (!groupId) {
      return res.status(422).json({
        status: "error",
        message: "Group Id is required.",
      });
    }

    const parsedGroupId = parseInt(groupId, 10);
    if (isNaN(parsedGroupId)) {
      return res.status(422).json({
        status: "error",
        message: "Invalid Group Id.",
      });
    }

    const offset = (page - 1) * pageSize;

    // Fetch expenses with pagination
    const expenses = await Expense.findAndCountAll({
      where: {
        groupId: parsedGroupId,
        status: SETTLEMENT_STATUS.ACCEPTED,
        settlementStatus: SETTLEMENT_STATUS.PENDING,
        isVerified: "1",
      },
      include: [
        {
          model: Member,
          include: [
            {
              model: User,
              attributes: {
                exclude: [
                  "password",
                  "isAdmin",
                  "country",
                  "postalCode",
                  "street",
                  "imgUrl",
                  "isVerified",
                  "status",
                  "createdAt",
                  "updatedAt",
                  "remarks",
                  "contact",
                ],
              },
            },
          ],
          attributes: { exclude: ["isAdmin", "createdAt", "updatedAt"] },
        },
        { model: Group },
      ],
      attributes: { exclude: ["isAdmin", "updatedAt"] },
      limit: pageSize,
      offset: offset,
    });
    const group = await Group.findOne({
      where: { id: groupId },
      include: [
        {
          model: db.member,
          include: [
            {
              model: db.user, // Assuming members are associated with users
              attributes: ["id", "email"], // Fetch only necessary fields
            },
          ],
          attributes: ["id", "memberName"], // Fetch member-specific fields
        },
      ],
      attributes: ["id", "groupName"], // Fetch group-specific fields
    });
    const members = group.Members;

    // Check if no expenses found
    if (!expenses || expenses.count === 0) {
      return res.status(200).json({
        status: "error",
        message: `No expenses found.`,
        data: [],
      });
    }
    const _expenseData = changeExpenseData(expenses.rows);
    const transformedExpenses = transformExpenses(expenses.rows);
    // Group expenses by userId and calculate total expenses per user
    const groupedExpenses = transformedExpenses.reduce((acc, expense) => {
      const userId = expense.Member.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId: userId,
          userName: expense.Member.memberName, // Assuming the user name field exists
          totalExpense: 0,
        };
      }
      acc[userId].totalExpense += expense.amount; // Assuming 'amount' field exists in the expense
      return acc;
    }, {});

    // Convert grouped data to an array
    const groupedExpenseList = Object.values(groupedExpenses);

    // Return the response
    return res.status(200).json({
      status: "ok",
      message: `Expenses retrieved successfully.`,
      data: _expenseData,
      expenses: groupedExpenseList,
      totalItems: expenses.count,
      totalPages: Math.ceil(expenses.count / pageSize),
      currentPage: page,
      members: members,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve expenses.",
      error: error.message,
    });
  }
};

// exports.getAcceptedExpenses = async (req, res) => {
//   const userId = req.userId; // The ID of the current user
//   const { groupId } = req.query;
//   const page = parseInt(req.query.page) || 1;
//   const pageSize = Math.min(parseInt(req.query.limit) || 100, 1000);

//   try {
//     // Validate groupId
//     if (!groupId) {
//       return res.status(422).json({
//         status: "error",
//         message: "Group Id is required.",
//       });
//     }

//     const parsedGroupId = parseInt(groupId, 10);
//     if (isNaN(parsedGroupId)) {
//       return res.status(422).json({
//         status: "error",
//         message: "Invalid Group Id.",
//       });
//     }

//     const offset = (page - 1) * pageSize;

//     // Fetch expenses with pagination
//     const expenses = await Expense.findAndCountAll({
//       where: {
//         groupId: parsedGroupId,
//         status: SETTLEMENT_STATUS.ACCEPTED,
//         isVerified: "1",
//       },
//       include: [
//         {
//           model: Member,
//           include: [
//             {
//               model: User,
//               attributes: {
//                 exclude: [
//                   "password",
//                   "isAdmin",
//                   "country",
//                   "postalCode",
//                   "street",
//                   "imgUrl",
//                   "isVerified",
//                   "status",
//                   "createdAt",
//                   "updatedAt",
//                   "remarks",
//                   "contact",
//                 ],
//               },
//             },
//           ],
//           attributes: { exclude: ["isAdmin", "createdAt", "updatedAt"] },
//         },
//         { model: Group },
//       ],
//       attributes: { exclude: ["isAdmin", "updatedAt"] },
//       limit: pageSize,
//       offset: offset,
//     });

//     // Fetch all members of the group
//     const group = await Group.findOne({
//       where: { id: groupId },
//       include: [
//         {
//           model: db.member,
//           include: [
//             {
//               model: db.user, // Assuming members are associated with users
//               // attributes: ["id", "name", "email"], // Fetch necessary fields
//             },
//           ],
//           attributes: ["id", "memberName"], // Fetch member-specific fields
//         },
//       ],
//       attributes: ["id", "groupName"], // Fetch group-specific fields
//     });

//     if (!group) {
//       return res.status(404).json({
//         status: "error",
//         message: "Group not found.",
//       });
//     }

//     const members = group.Members; // All members of the group

//     // Check if no expenses found
//     if (!expenses || expenses.count === 0) {
//       return res.status(200).json({
//         status: "error",
//         message: `No expenses found.`,
//         data: [],
//       });
//     }

//     // Calculate total expense and divide among all members
//     const totalExpense = expenses.rows.reduce(
//       (acc, expense) => acc + expense.amount,
//       0
//     ); // Assuming 'amount' field exists
//     const perMemberShare = parseFloat(
//       (totalExpense / members.length).toFixed(2)
//     );

//     // Prepare response data for each member
//     const memberExpenses = members.map((member) => ({
//       userId: member.userId,
//       userName: member.memberName,
//       totalExpense: perMemberShare, // Equal share for every member
//     }));

//     // Transform expense data for detailed response
//     const _expenseData = changeExpenseData(expenses.rows);

//     // Return the response
//     return res.status(200).json({
//       status: "ok",
//       message: `Expenses retrieved successfully.`,
//       data: _expenseData,
//       expenses: memberExpenses, // Equal share for all members
//       totalItems: expenses.count,
//       totalPages: Math.ceil(expenses.count / pageSize),
//       currentPage: page,
//       members: members,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve expenses.",
//       error: error.message,
//     });
//   }
// };

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

exports.getSettlements = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  try {
    const { count, rows } = await Settlement.findAndCountAll({
      limit,
      offset: (page - 1) * limit,
      raw: true,
      attributes: {
        exclude: [""],
      },
    });

    console.log(rows);
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
    return res
      .status(200)
      .send(getResponseBody("ok", "Data retrived successfull.", dataRows));
  } catch (error) {
    return res.status(500).send(getResponseBody("error", error.message, []));
  }
};

/**
 * Helper function to transform expenses
 * Renames the 'user' key to 'userDetails' in the Member object
 * @param {Array} expenses - List of expenses
 * @returns {Array} - Transformed expenses
 */
const changeExpenseData = (expenses) => {
  return expenses.map((expense) => {
    const plainExpense = expense.toJSON(); // Convert Sequelize instance to plain object
    if (plainExpense.Member && plainExpense.Member.user) {
      plainExpense.Member.userDetails = plainExpense.Member.user; // Rename key
      delete plainExpense.Member.user; // Remove the original key
    }
    return plainExpense;
  });
};

const transformExpenses = (expenses) => {
  return expenses.map((expense) => {
    const plainExpense = expense.toJSON(); // Convert Sequelize instance to plain object
    // Rename 'User' to 'userDetails' within 'Member'
    if (plainExpense.Member && plainExpense.Member.User) {
      plainExpense.Member.userDetails = plainExpense.Member.User; // Rename 'User' to 'userDetails'
      delete plainExpense.Member.User; // Remove the original 'User' key
    }

    console.log(plainExpense);
    return plainExpense;
  });
};

exports.createSettlement = async (req, res) => {
  const { settledBy, remarks, expenseIds, groupId } = req.body; // Added groupId to the request body

  if (!Array.isArray(expenseIds) || expenseIds.length === 0 || !groupId) {
    return res.status(400).json({
      status: "error",
      message: "GroupId, and expense IDs are required.",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    // Fetch all expenses to settle
    const expenses = await Expense.findAll({
      where: {
        id: expenseIds,
        settlementStatus: SETTLEMENT_STATUS.PENDING, // Only include unsettled expenses
        groupId: groupId,
      },
      transaction,
    });

    if (expenses.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No unsettled expenses found with the provided IDs.",
      });
    }

    const totalAmount = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Generate the settlement title with UUID, current date, and group ID
    const date = new Date().toISOString().split("T")[0].replace(/-/g, ""); // Format as YYYYMMDD
    const settlementTitle = `SE-${date}-${groupId}-${uuidv4()}`;

    // Create a new settlement
    const settlement = await Settlement.create(
      {
        title: settlementTitle,
        settledBy: req.userId,
        remarks,
        status: SETTLEMENT_STATUS.SETTLED,
        totalAmount,
      },
      { transaction }
    );
    // this is foreign key
    // Use the association to create the GroupSettlement
    await settlement.createGroupSettlement({ groupId }, { transaction });

    // Map expenses to the settlement
    const expenseSettlementData = expenses.map((expense) => ({
      expenseId: String(expense.id),
      ExpenseId: String(expense.id),
      settlementId: String(settlement.id),
    }));
    // console.log("DATA", expenseSettlementData);

    await ExpenseSettlement.bulkCreate(expenseSettlementData, { transaction });

    // Update settlementStatus of all related expenses
    await Expense.update(
      { settlementStatus: "SETTLED", status: "SETTLED" },
      {
        where: {
          id: expenseIds,
        },
        transaction,
      }
    );

    // Commit transaction
    await transaction.commit();

    return res.status(201).json({
      status: "ok",
      message: "Settlement created successfully.",
      data: settlement,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating settlement:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create settlement.",
      error: error.message,
    });
  }
};
