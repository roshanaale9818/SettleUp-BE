const db = require("../models");
const User = db.user;
const Group = db.group; //group model
const delay = require("./../util/helper");
const { getResponseBody } = require("./../util/util");
const Member = db.member;
const Invitation = db.invitation;
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const GroupMember = db.groupMember;
const Expense = db.expense;

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAILPASSWORD, // Your email password
  },
});

// Configure Handlebars options
transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".hbs",
      partialsDir: path.resolve("./app/views/email/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./app/views/email/"),
    extName: ".hbs",
  })
);

// create group
exports.createGroup = async (req, res) => {
  await delay(3000); // delaying for some seconds
  try {
    const reqBody = {
      ...req.body,
      createdBy: req.userId,
      status: "1",
      imgUrl: "",
      remarks: "",
    };
    //finding the creator from database
    const user = await User.findOne({
      where: {
        id: req.userId,
      },
    });
    if (!user) {
      res
        .status(400)
        .send(getResponseBody("error", "Cannot find user database."));
    }
    const result = await Group.create(
      {
        ...reqBody,
        Members: [
          {
            userId: req.userId,
            memberName: `${user.firstName} ${user.lastName}`,
            isAdmin: 1,
            status: "1",
          },
        ],
      },
      {
        include: [Member],
      }
    );

    // console.log("THIS IS RESULT",result);
    res
      .status(200)
      .send(getResponseBody("ok", "Group created successfull", result));
  } catch (error) {
    // console.log("errr",err.message)
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.map((err) => err.message);
      res.status(400).json({ status: "error", errors });
    } else {
      res.status(500).send(getResponseBody("error", error.message, []));
    }
  }
};

// get group list with members with the token and user
exports.getGroupList = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  try {
    const { count, rows } = await Group.findAndCountAll({
      include: [
        {
          model: Member,
          where: {
            userId: String(req.userId),
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

// invite to the group
exports.inviteToGroup = async (req, res) => {
  try {
    const { userEmail, groupId } = req.body;
    if (!userEmail) {
      return res
        .status(400)
        .send(getResponseBody("error", "User email is required.", []));
    } else if (!groupId) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group Id is required.", []));
    }
    const group = await Group.findOne({
      where: {
        id: groupId || null,
      },
    });
    // inviting user
    const user = await User.findOne({
      where: {
        id: req.userId,
      },
    });

    const inviteResult = await Invitation.create({
      userEmail,
      invitedBy: req.userId,
      groupId: groupId,
      joinStatus: "0",
    });
    if (!inviteResult) {
      return res
        .status(400)
        .send(getResponseBody("error", "Invitation failed"));
    }

    // console.log(user.firstName)
    const mailOptions = {
      from: "expenseshareauth@gmail.com", // Sender address
      to: userEmail, // List of receivers
      subject: "Group Invitation", // Subject line
      template: "invitation", // The template name
      context: {
        inviteTo: userEmail,
        groupName: group.groupName,
        invitedBy: user.firstName,
        invitationLink: process.env.INVITATIONLINK || "http://localhost:3030",
      },
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(getResponseBody("error", error.message));
      }
      return res
        .status(200)
        .send(getResponseBody("ok", "Invitation sent successfull!"));
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(getResponseBody("error", err.message));
  }
};

exports.updateGroup = async (req, res) => {
  await delay(3000); // delaying for some seconds
  try {
    const { groupId, groupName } = req.body;
    if (!groupId) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group Id cannot be null", []));
    }

    //finding the creator from database
    const result = await Group.update(
      {
        groupName,
      },
      {
        where: {
          id: groupId,
          createdBy: req.userId,
        },
      }
    );
    // console.log("THIS IS RESULT",result);
    if (!result) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group updated failed", result));
    }
    return res
      .status(200)
      .send(getResponseBody("ok", "Group updated successfull"));
  } catch (error) {
    // console.log("errr",err.message)
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.map((err) => err.message);
      res.status(400).json({ status: "error", errors });
    } else {
      res.status(500).send(getResponseBody("error", error.message, []));
    }
  }
};

exports.addGroupMember = async (req, res) => {
  try {
    const { userEmail, groupId } = req.body;
    if (!userEmail) {
      return res
        .status(400)
        .send(getResponseBody("error", "User email is required.", []));
    } else if (!groupId) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group Id is required.", []));
    }
    const group = await Group.findOne({
      where: {
        id: groupId || null,
      },
    });
    if (!group || group.length == 0) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group doesnot exist."));
    }
    // inviting user
    const user = await User.findOne({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      return res
        .status(400)
        .send(
          getResponseBody("error", "User No Found. Please invite user first.")
        );
    }
    const isMember = await Group.findOne({
      include: [
        {
          model: Member,
          where: { userId: String(user.id) },
        },
      ],
      where: { id: groupId },
    });

    // check if user is already on group

    if (isMember) {
      return res
        .status(400)
        .send(getResponseBody("error", "User is already on group."));
    }

    // else add member
    const memberResult = await Member.create({
      userId: user.id,
      memberName: user.firstName,
      isAdmin: 0,
      status: "1",
    });
    const result = await group.addMember(memberResult);
    await memberResult.addGroup(group);
    if (!result) {
      return res
        .status(200)
        .send(getResponseBody("error", "User addition failed.", result));
    }

    return res
      .status(200)
      .send(getResponseBody("ok", "User added successfull.", result));
  } catch (err) {
    console.log(err);
    return res.status(500).send(getResponseBody("error", err.message));
  }
};

exports.removeGroupMember = async (req, res) => {
  try {
    const { userId, groupId, memberId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .send(getResponseBody("error", "User id is required.", []));
    } else if (!groupId) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group Id is required.", []));
    }
    const group = await Group.findOne({
      where: {
        id: groupId || null,
      },
    });
    if (!group || group.length == 0) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group doesnot exist."));
    }
    // inviting user
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res
        .status(400)
        .send(getResponseBody("error", "User doesnot exist."));
    }

    const member = await Member.findOne({
      where: {
        id: memberId,
      },
    });
    // console.log("MEMBER",member);
    // const result = await group.removeMember(member);

    const _groupMember = await GroupMember.findOne({
      where: {
        GroupId: Number(groupId),
        MemberId: member.id,
      },
    });
    console.log("GROUP MEMBER", _groupMember);
    if (!_groupMember) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group Member cannot be found"));
    }

    const result = await GroupMember.destroy({
      where: {
        GroupId: Number(groupId),
        MemberId: member.id,
      },
    });
    if (!result) {
      return res
        .status(400)
        .send(getResponseBody("error", "User failed to remove."));
    }

    return res
      .status(200)
      .send(getResponseBody("ok", "User removed successfull.", result));
  } catch (err) {
    console.log(err);
    return res.status(500).send(getResponseBody("error", err.message));
  }
};

exports.deleteGroup = async (req, res) => {
  await delay(3000); // delaying for some seconds
  try {
    const { groupId } = req.body;
    if (!groupId) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group Id cannot be null", []));
    }

    //finding the creator from database
    const result = await Group.update(
      {
        status: "0",
      },
      {
        where: {
          id: groupId,
          createdBy: req.userId,
        },
      }
    );
    // console.log("THIS IS RESULT",result);
    if (!result) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group delete failed", result));
    }
    return res
      .status(200)
      .send(getResponseBody("ok", "Group deleted successfull"));
  } catch (error) {
    // console.log("errr",err.message)
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.map((err) => err.message);
      res.status(400).json({ status: "error", errors });
    } else {
      res.status(500).send(getResponseBody("error", error.message, []));
    }
  }
};

exports.getGroup = async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group id is required."));
    }
    const group = await Group.findOne({
      include: [
        {
          model: Member,
          attributes: {
            exclude: ["group_members"],
          },
        },
        {
          model: Expense,
          attributes: {
            exclude: [""],
          },
        },
      ],
      where: {
        id: groupId || null,
        status: "1",
      },
      attributes: {
        exclude: ["group_members"],
      },
    });
    // console.log("CREATEDBY",group.createdBy, req.userId);
    const user = await User.findOne({
      where: {
        id: Number(group.createdBy),
      },
    });
    group.setDataValue(
      "isAdmin",
      group.createdBy === String(req.userId) ? "1" : "0"
    );
    group.setDataValue("creatorName", `${user.firstName} ${user.lastName}`);
    if (!group) {
      return res.status(400).send(getResponseBody("error", "Group not found"));
    } else {
      return res
        .status(200)
        .send(getResponseBody("ok", "Group found successfull.", group));
    }
  } catch (err) {
    return res.status(400).send(getResponseBody("error", err.message));
  }
};

// get group list with members with the token and user
exports.getAllGroups = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  try {
    const { count, rows } = await Group.findAndCountAll({
      include: [
        {
          model: Member,
          where: {
            userId: String(req.userId),
          },
          attributes: {
            exclude: ["group_members"],
          },
        },
      ],
      where: {
        status: "1",
      },
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

// get members of the group
exports.getMembers = async (req, res) => {
  try {
    const { groupId } = req.query;
    console.log("GROUPID", groupId);
    if (!groupId) {
      return res
        .status(400)
        .send(getResponseBody("error", "Group id is required."));
    }
    const group = await Group.findOne({
      include: [
        {
          model: Member,
          attributes: {
            exclude: ["group_members"],
          },
        },
      ],
      where: {
        id: groupId || null,
        status: "1",
      },
      attributes: {
        exclude: ["group_members"],
      },
    });
    // console.log("CREATEDBY",group.createdBy, req.userId);
    const user = await User.findOne({
      where: {
        id: Number(group.createdBy),
      },
    });
    group.setDataValue(
      "isAdmin",
      group.createdBy === String(req.userId) ? "1" : "0"
    );
    group.setDataValue("creatorName", `${user.firstName} ${user.lastName}`);
    if (!group) {
      return res.status(400).send(getResponseBody("error", "Group not found"));
    } else {
      return res
        .status(200)
        .send(getResponseBody("ok", "Group found successfull.", group));
    }
  } catch (err) {
    return res.status(400).send(getResponseBody("error", err.message));
  }
};

// exports.getGroupExpenses = async (req, res) => {
//   const userId = req.userId;
//   const { groupId } = req.query;
//   try {
//     if (!groupId) throw new Error("Group Id is required.")
//     const expenses = await Expense.findAll({
//       where: {
//         groupId: groupId
//       },
//       include: [
//         {
//           model: Member,
//         },
//       ]
//     });

//     // Handle the case where no expenses are found
//     if (!expenses || expenses.length === 0) {
//       return res.status(200).json({
//         status: 'error',
//         message: 'No expenses found for other users in your groups',
//         data: []
//       });
//     }

//     // Return the list of expenses associated with other users in your groups
//     return res.status(200).json({
//       status: 'ok',
//       message: 'Expenses retrieved successfully for other users in your groups',
//       data: expenses
//     });

//   } catch (error) {
//     // Handle errors
//     return res.status(400).json({
//       status: 'error',
//       message: 'Failed to retrieve expenses',
//       error: error.message
//     });
//   }
// }

exports.getGroupExpenses = async (req, res) => {
  const userId = req.userId;
  const { groupId } = req.query;
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Default page size

  try {
    if (!groupId) throw new Error("Group Id is required.");

    const offset = (page - 1) * pageSize;

    const expenses = await Expense.findAndCountAll({
      where: {
        groupId: groupId,
      },
      include: [
        {
          model: Member,
        },
      ],
      limit: pageSize,
      offset: offset,
    });

    // the case where no expenses are found
    if (!expenses || expenses.count === 0) {
      return res.status(200).json({
        status: "ok",
        message: "No expenses found for other users in your groups",
        data: [],
      });
    }

    // Return the list of expenses associated with other users in your groups
    return res.status(200).json({
      status: "ok",
      message: "Expenses retrieved successfull for other users in your groups",
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
exports.transporter = transporter;
