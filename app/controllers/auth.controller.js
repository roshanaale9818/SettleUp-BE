const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const isRequiredMessage = require("../util/validateRequest");
const TOKEN = require('../util/token');
const createError = require('http-errors');

exports.signup = (req, res) => {
  let { username, email, password, isAdmin } = req.body;

  console.log("HERE", username);


  if (!username) {
    res.send({ status: "error", message: isRequiredMessage('Username') });
  }
  else if (!email) {
    res.send({ status: "error", message: isRequiredMessage('Email') });
  }
  else if (!password) {
    res.send({ status: "error", message: isRequiredMessage('Password') });
  }

  // else if (!isAdmin) {
  //   res.send({ status: "error", message: isRequiredMessage('Key') });
  // }

  else {

    // if (isAdmin !== '9818009826') {
    //   res.send({ status: "error", message: "Invalid key. Could not register user." });
    // }

    // else {
      // Save User to Database
      User.create({
        username: username,
        email: email,
        password: bcrypt.hashSync(req.body.password, 8),
      })
        .then(user => {
          user.setRoles([3]).then(() => {
            res.send({ status: "ok", message: "User was registered successfully!" });
          });
        })
        .catch(err => {
          res.status(500).send({ status: "error", message: err.message });
        });
    // }

  }
};

exports.signin = (req, res) => {

  let { username, password } = req.body;
  if (!username) {
    res.send({ status: "error", message: isRequiredMessage('Username') });
  }
  if (!password) {
    res.send({ status: "error", message: isRequiredMessage('Password') });
  }

  else {

    // else  
    User.findOne({
      where: {
        username: username
      }
    })
      .then(user => {
        // console.log("USER",user)
        if (!user) {
          // status(404)
          return res.send({ status: "error", message: "User Not found." });
        }

        let passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );

        if (!passwordIsValid) {
          // status(401)
          return res.send({
            status: "error",
            accessToken: null,
            message: "Invalid Credential!"
          });
        }

        let token = jwt.sign({ id: user.id }, config.secretKey, {
          expiresIn: 86400 // 24 hours
        });

        let authorities = [];
        let isAdmin = false;
        user.getRoles().then(roles => {
          for (let i = 0; i < roles.length; i++) {
            authorities.push("ROLE_" + roles[i].name.toUpperCase());
            if (roles[i].name.toUpperCase() === 'ADMIN') {
              isAdmin = true;
            }
          }
          if (isAdmin) {
            res.status(200).send({
              status: "ok",
              data: {
                id: user.id,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token,
              }

            });
          }
          else {
            res.status(400).send({
              status: "error",
              data: {
              },
              message: "Unauthorized"

            });
          }

        });
      })
      .catch(err => {
        res.status(500).send({ status: "error", message: err.message });
      });
  }
};

exports.getUsers = (req, res) => {
  let { username, password } = req.body;

  User.findAll({
    attributes: ['id', 'username', 'email', 'createdAt']

  })
    .then(users => {
      // console.log("USER",user)
      if (!users) {
        // status(404)
        return res.send({ status: "error", message: "No any users", data: users });
      }
      else {
        return res.send({ status: "ok", data: users });
      }

    }

    )




}
exports.login = (req,res,next)=>{
  if(!req.user){
    next(createError(401,'Please login'))
  }
}