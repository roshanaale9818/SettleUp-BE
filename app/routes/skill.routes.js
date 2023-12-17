const { authJwt } = require("../middleware");
const controller = require("../controllers/skill.controller");
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
    apiVersionPrefix+"skill/add",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.addSkill
  );


  // [authJwt.verifyToken, authJwt.isAdmin],

  app.get(
    apiVersionPrefix+ "skill/getskills",
  
    controller.getSkills
  );
  app.delete(
    apiVersionPrefix+ "skill/delete",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteSkill
  );
};