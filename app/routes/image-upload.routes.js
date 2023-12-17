const { authJwt } = require("../middleware");
const controller = require("../controllers/image-upload.controller");
const  apiVersionPrefix = require("../config/verison");
// const multer = require('multer');
const upload = require('../util/imageMulter');
module.exports = function(app) {
 
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });




app.post(apiVersionPrefix+"image/upload",upload.single('file'),controller.uploadImage);
app.post(apiVersionPrefix+"image/delete",controller.deleteImage);
app.post(apiVersionPrefix+"image/getimagelist",controller.getImagesList);
app.post(apiVersionPrefix+"image/getsingleimage",controller.getImage);







//   app.post(
//     apiVersionPrefix+"contact/sendmessage",
//     controller.createContactMessage
//   );


//   app.get(
//     apiVersionPrefix+ "contact/getMessages",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.getContactMessage
//   );




};