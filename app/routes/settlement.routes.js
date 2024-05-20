const { authJwt } = require("../middleware");
const controller = require("../controllers/expense.controller");
const apiVersionPrefix = require("../config/verison");
const { userIsInGroup } = require("../middleware/verifyGroup");

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
    controller.addExpense
  );
  app.get(
    `${apiVersionPrefix}settlement/list`,
    [authJwt.verifyToken],
    controller.getExpenseList
  );
};
