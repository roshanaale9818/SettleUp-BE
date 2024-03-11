const db = require("../models");
const isRequiredMessage = require("../util/validateRequest");
const ROLES = db.ROLES;
const User = db.user;
// validate there is unique email and username 
verifyRequestHasEmailAndUsername = (req, res, next) => {
 let {username,email}= req.body;
 if (!username) {
  res.send({ status: "error", message: isRequiredMessage('Username') });
}
if (!email) {
  res.send({ status: "error", message: isRequiredMessage('Email') });
}
next();

};



// validate the unique emails 
checkDuplicateEmail = (req, res, next) => {
  try{
      // Email
      User.findOne({
        where: {
          email: req.body.email || null
        }
      }).then(user => {
        if (user) {
          res.status(200).send({
              status:"error",
              data:[],
            message: "Failed! Email is already in use!"
          });
          return;
        }
  
        next();
      });
    }
    catch(error){
      console.log("Something went wrong")
      res.status(400).json({status:"error",message:error})
    }
};


// validate if there is roles existed 
checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
            status:"error",
            data:[],
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  checkRolesExisted: checkRolesExisted,
  verifyRequestHasEmailAndUsername:verifyRequestHasEmailAndUsername
};

module.exports = verifySignUp;