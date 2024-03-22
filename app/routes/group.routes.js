const { authJwt, groupUserIsAdmin } = require("../middleware");
const apiVersionPrefix = require("../config/verison");
const groupcontroller = require('./../controllers/group.controller');
const { userIsInGroup } = require("../middleware/verifyGroup");
// require('../util/')
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.post(`${apiVersionPrefix}group/create`, [authJwt.verifyToken], groupcontroller.createGroup);
    app.post(`${apiVersionPrefix}group/update`, [authJwt.verifyToken, groupUserIsAdmin], groupcontroller.updateGroup);
    app.post(`${apiVersionPrefix}group/delete`, [authJwt.verifyToken, groupUserIsAdmin], groupcontroller.deleteGroup);
    app.get(`${apiVersionPrefix}group/getgrouplist`, [authJwt.verifyToken], groupcontroller.getGroupList);
    app.post(`${apiVersionPrefix}group/inviteuser`, [authJwt.verifyToken], groupcontroller.inviteToGroup);
    app.post(`${apiVersionPrefix}group/addgroupmember`, [authJwt.verifyToken, userIsInGroup], groupcontroller.addGroupMember);
    app.post(`${apiVersionPrefix}group/removegroupmember`, [authJwt.verifyToken, groupUserIsAdmin, userIsInGroup], groupcontroller.removeGroupMember);


};