const { authJwt } = require("../middleware");
const controller = require("../controllers/personalinfo.controller");
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
    apiVersionPrefix+"personalinfo/save",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.savePersonalInfo
  );


  // [authJwt.verifyToken, authJwt.isAdmin],

  app.get(
    apiVersionPrefix+ "personalinfo/getPersonalInfo",
  
    controller.getPersonalInfo
  );
};