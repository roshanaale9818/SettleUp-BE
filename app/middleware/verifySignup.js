const db = require("../models");
const isRequiredMessage = require("../util/validateRequest");
const ROLES = db.ROLES;
const User = db.user;




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


checkDuplicateUsernameOrEmail = (req, res, next) => {

  // Username
  User.findOne({
    where: {
      username: req.body.username
    }
  }).then(user => {
    if (user) {
      res.status(200).send({
        status:"error",
        data:[],
        message: "Failed! Username is already in use!"
      });
      return;
    }

    // Email
    User.findOne({
      where: {
        email: req.body.email
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
  });
};

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
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted,
  verifyRequestHasEmailAndUsername:verifyRequestHasEmailAndUsername
};

module.exports = verifySignUp;