const {authJwt } = require("../middleware");
const apiVersionPrefix = require("../config/verison");
const groupcontroller = require('./../controllers/group.controller');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.post(`${apiVersionPrefix}group/create`, [authJwt.verifyToken], groupcontroller.createGroup)


};