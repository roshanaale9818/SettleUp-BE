const { authJwt } = require("../middleware");
const controller = require("../controllers/settlement.controller");
const apiVersionPrefix = require("../config/verison");
const { userIsInGroup, userIsAdmin } = require("../middleware/verifyGroup");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    `${apiVersionPrefix}settlement/create`,
    [authJwt.verifyToken, userIsInGroup],
    controller.createSettlement
  );
  app.get(
    `${apiVersionPrefix}settlement/preview/expense`,
    [authJwt.verifyToken, userIsInGroup, userIsAdmin],
    controller.getAcceptedExpenses
  );

  app.get(
    `${apiVersionPrefix}settlement/group`,
    [authJwt.verifyToken],
    controller.getAdminGroups
  );
};
