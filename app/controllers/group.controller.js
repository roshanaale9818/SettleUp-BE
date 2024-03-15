const db = require("../models");
const User = db.user;
// const isRequiredMessage = require("../util/validateRequest");
const delay = require('./../util/helper');
const { getResponseBody } = require('./../util/util')

// create group 
exports.createGroup = async (req, res) => {
    await delay(3000); // delaying for some seconds
    try {
        hello;
        // return sequelize.transaction(async (t) => {
        //     const group = await Group.create({ group_name: 'Group A' }, { transaction: t });
        //     const member = await Member.create({ member_name: 'John Doe' }, { transaction: t });
        //     await GroupMember.create({ join_date: new Date(), GroupId: group.group_id, MemberId: member.member_id }, { transaction: t });
        //   });

    }
    catch (err) {
        // console.log("errr",err.message)
        res.status(500).send(getResponseBody('error', err.message, []));
    }
}
