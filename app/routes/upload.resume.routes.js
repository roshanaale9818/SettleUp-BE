const { authJwt } = require("../middleware");
const controller = require("../controllers/upload.resume.controller");
const  apiVersionPrefix = require("../config/verison");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
module.exports = function(app) {
 
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    apiVersionPrefix+"resume/upload",
    // [authJwt.verifyToken, authJwt.isAdmin],
    upload.single('file'),
    controller.saveResume
  );
  app.get(apiVersionPrefix+"resume/download",
  // [authJwt.verifyToken, authJwt.isAdmin],
  controller.downloadResume);

  app.get(apiVersionPrefix+"resume/getall",
  // [authJwt.verifyToken, authJwt.isAdmin],
  controller.getAllResume);
};