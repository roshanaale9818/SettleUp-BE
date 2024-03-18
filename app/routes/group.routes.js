const {authJwt,groupUserIsAdmin } = require("../middleware");
const apiVersionPrefix = require("../config/verison");
const groupcontroller = require('./../controllers/group.controller');
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
    app.post(`${apiVersionPrefix}group/update`, [authJwt.verifyToken,groupUserIsAdmin], groupcontroller.updateGroup);
    app.get(`${apiVersionPrefix}group/getgrouplist`, [authJwt.verifyToken,verifyGroupHasUser], groupcontroller.getGroupList);
    app.post(`${apiVersionPrefix}group/inviteuser`, [authJwt.verifyToken], groupcontroller.inviteToGroup);
};