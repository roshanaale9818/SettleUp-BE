const { authJwt } = require("../middleware");
const controller = require("../controllers/project.controller");
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
    apiVersionPrefix+"project/add",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.addProject
  );



  // [authJwt.verifyToken, authJwt.isAdmin],
  app.get(
    apiVersionPrefix+ "project/getProjects",
   
    controller.getProjects
  );
  app.delete(
    apiVersionPrefix+ "project/delete",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteProject
  );
  app.post(
    apiVersionPrefix+ "project/update",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateProject
  );
};