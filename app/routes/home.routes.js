const { authJwt } = require("../middleware");
const controller = require("../controllers/home.controller");
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
    apiVersionPrefix+"home/save",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.saveHomeData
  );


  // [authJwt.verifyToken, authJwt.isAdmin],
  app.get(
    apiVersionPrefix+ "home/gethome",
  
    controller.getHomeInfo
  );
};