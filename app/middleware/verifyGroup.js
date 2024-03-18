const delay = require("../util/helper");
const db = require("../models");
const { getResponseBody } = require("../util/util");
// const User = db.user;
const Group = db.group;
const Member = db.member;

// validate the unique emails 
verifyGroupHasUser = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    const group = await Group.findAll({
      include: [{
        model: Member,
        where: {
          userId: String(req.userId),
          // id: Number(req.body.groupId),
          // isAdmin: String(1)
        },
        attributes: {
          exclude: ['group_members']
        }
      }],
      where: {
        id: groupId
      }

    });
    // console.log("Group", group)
    if (!group || group.length == 0) {
      return res.status(400).send(getResponseBody('error', "Unauthorized, Group user is not admin or Member doesnot exist in that group."))
    }
    next();




  }
  catch (error) {
    console.log("Something went wrong")
    return res.status(400).json({ status: "error", message: error.message })
  }
};


verifyGroupUserIsAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    // console.log("USER ID IN TOKEN", req.userId)
    // Email
    const group = await Group.findAll({
      // where: {
      //   id: String(req.body.groupId),
      //   createdBy:String(req.userId),
      // }
      include: [{
        model: Member,
        where: {
          userId: String(req.userId),
          // id: Number(req.body.groupId),
          isAdmin: String(1)
        },
        attributes: {
          exclude: ['group_members']
        }
      }],

      where: {
        id: groupId
      }

    });
    // console.log("Group", group)
    if (!group || group.length == 0) {
      return res.status(400).send(getResponseBody('error', "Unauthorized, Group user is not admin or group has no member."))
    }
    next();




  }
  catch (error) {
    console.log("Something went wrong")
    return res.status(400).json({ status: "error", message: error.message })
  }
};
const verifyGroup = {
  userIsAdmin: verifyGroupUserIsAdmin,
  userIsInGroup:verifyGroupHasUser
}

module.exports = verifyGroup;



