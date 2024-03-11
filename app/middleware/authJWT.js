const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Token = db.token;

verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      status: "error",
      message: "Unauthorized. Token is required!"
    });
  }

  await Token.findOne({
    where: {
      token: token
    }
  }).then((_token => {
    if (!_token) {
      res.status(400).send({ status: 'error', message: "Token Invalid or Expired." })
      return;
    }
    else {
      jwt.verify(token, config.SECRETKEY, (err, decoded) => {
        if (err) {
          return res.status(401).send({
            status: "error",
            message: "Unauthorized!  Invalid Token"
          });
        }
        //geting the userid from decoding from token
        req.userId = decoded.id;
        req.email = decoded.email,
        db.role = decoded.role;
        next();
      });
    }
  }))


};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    if (user) {
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({
          status: "error",
          message: "You are not authorized to access this request."
        });
        return;
      });
    }
    else {
      res.status(403).send({
        status: "error",
        message: "Unauthorized. Invalid token"
      });
      return;
    }
  }

  );
};

isModerator = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }
      }

      res.status(403).send({
        status: "error",
        message: "You are not authorized to access this request."
      });
    });
  });
};

isModeratorOrAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }

        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        status: "error",
        message: "You are not authorized to access this request."
      });
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isModerator,
  isModeratorOrAdmin: isModeratorOrAdmin
};
module.exports = authJwt;