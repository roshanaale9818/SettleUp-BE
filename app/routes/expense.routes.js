const { authJwt } = require("../middleware");
const controller = require("../controllers/expense.controller");
const apiVersionPrefix = require("../config/verison");
const { userIsInGroup } = require("../middleware/verifyGroup");

// const usersController = require("../controllers/users.controller")

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(`${apiVersionPrefix}expense/add`, [authJwt.verifyToken, userIsInGroup], controller.addExpense);


};