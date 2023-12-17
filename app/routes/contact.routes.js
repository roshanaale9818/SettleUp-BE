const { authJwt } = require("../middleware");
const controller = require("../controllers/contact.controller");
const  apiVersionPrefix = require("../config/verison");

module.exports = function(app) {
 
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    apiVersionPrefix+"contact/sendmessage",
    controller.createContactMessage
  );


  app.get(
    apiVersionPrefix+ "contact/getMessages",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getContactMessage
  );
};