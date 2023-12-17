const { authJwt } = require("../middleware");
const controller = require("../controllers/socialmedia.controller");
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
    apiVersionPrefix+"socialmedia/save",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.saveSocialMedia
  );

  // [authJwt.verifyToken, authJwt.isAdmin],
  app.get(
    apiVersionPrefix+ "socialmedia/getsocialmedia",
   
    controller.getSocialMedia
  );
  app.delete(
    apiVersionPrefix+ "socialmedia/delete",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteSocialMedia
  );
};