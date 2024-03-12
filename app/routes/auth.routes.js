const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");
const apiVersionPrefix = require("../config/verison");



module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(apiVersionPrefix + "user/auth/login", controller.login);
  app.post(apiVersionPrefix + "user/auth/register", [verifySignUp.checkDuplicateEmail,
  verifySignUp.checkRolesExisted
  ], controller.registerUser);
  app.post(`${apiVersionPrefix}user/auth/logout`, [authJwt.verifyToken], controller.logout)


};