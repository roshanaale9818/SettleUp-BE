const db = require("../models");
require("dotenv").config();

const User = db.user;
const Token = db.token;
const bcrypt = require("bcryptjs");
const isRequiredMessage = require("../util/validateRequest");
const TokenGenerator = require("../util/token");
const delay = require("./../util/helper");
const { transporter } = require("./group.controller");
const { getResponseBody } = require("../util/util");
const requestPasswordReset =
  require("../services/auth.service").requestPasswordReset;
const changePassword = require("../services/auth.service").changePassword;

// user login
exports.login = async (req, res) => {
  try {
    await delay(2000); // awaiting delaying the request to process.
    let { email, password } = req.body;
    if (!email) {
      res
        .status(400)
        .send({ status: "error", message: isRequiredMessage("Email") });
    } else if (!password) {
      res
        .status(400)
        .send({ status: "error", message: isRequiredMessage("Password") });
    } else {
      User.findOne({
        where: {
          email: email || null,
        },
      })
        .then(async (user) => {
          if (!user) {
            return res.status(400).send({
              status: "error",
              message: "Email or password is invalid.",
            });
          }

          let passwordIsValid = bcrypt.compareSync(password, user.password);

          if (!passwordIsValid) {
            return res.status(400).send({
              status: "error",
              message: "Invalid email or password.",
            });
          }
          let authorities = [];
          // let isAdmin = false;
          await user.getRoles().then((roles) => {
            for (let i = 0; i < roles.length; i++) {
              authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
          });
          let token = "";
          await TokenGenerator.signAccessToken(
            user.id,
            user.email,
            authorities[0]
          )
            .then(async (_token) => {
              token = _token.access_token;
              try {
                //delete every other token so that they cannot be used for the same user.
                //  await Token.destroy({
                //     where:{
                //       createdBy:user.id
                //     }
                //   });
                Token.create({
                  token: token,
                  createdBy: user.id,
                });
              } catch (err) {
                res.status(500).send({
                  status: "error",
                  message: "Internal Server at generating token",
                  errors: err,
                });
              }
            })
            .catch((err) => {
              res.status(400).send({
                status: "error",
                message: "Internal server",
                data: err,
              });
            });
          const data = {
            id: user.id,
            email: user.email,
            roles: authorities,
            accessToken: token,
            street: user.street,
            city: user.city,
            isVerified: user.isVerified,
            country: user.country,
            contact: user.contact,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            state: user.state,
            imgUrl: user.imgUrl,
          };
          res.status(200).send({
            status: "ok",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).send({ status: "error", message: err.message });
        });
    }
  } catch (error) {
    res.status(500).send({ status: "error", message: "Something went wrong." });
  }
};
//registering the user
exports.registerUser = async (req, res) => {
  try {
    const {
      email,
      firstName,
      middleName,
      lastName,
      password,
      contact,
      street,
      postalCode,
      country,
      state,
    } = req.body;
    const data = {
      password: password ? bcrypt.hashSync(password, 8) : null,
      email: email,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      contact: contact,
      status: "1",
      remarks: "",
      street,
      postalCode,
      country,
      state,
      isVerified: 0,
      imgUrl: "",
    };
    User.create(data)
      .then((user) => {
        // 1 is for user roles
        user.setRoles([1]).then((data) => {
          res.status(201).json({
            status: "ok",
            message: "User created successfull.",
          });
        });
      })
      .catch((error) => {
        if (
          error.name === "SequelizeValidationError" ||
          error.name === "SequelizeUniqueConstraintError"
        ) {
          const errors = error.errors.map((err) => err.message);
          res.status(400).json({ status: "error", errors });
        } else {
          res
            .status(400)
            .json({ status: "error", message: "Error occured in register" });
        }
      });
  } catch (error) {
    res
      .status(400)
      .json({ status: "error", message: "Error occured in register" });
  }
};
exports.logout = (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    const data = Token.destroy({
      where: {
        token: token,
      },
    });
    if (data) {
      res.status(200).send({ status: "ok", mesage: "Logged out successfull." });
    } else {
      res.status(400).send({ status: "error", message: err });
    }
  } catch (err) {
    console.log("CAUGHT ERROR", err);
    res.status(400).send({ status: "error", message: err });
  }
};

exports.sendResetPasswordEmail = async (req, res) => {
  try {
    await delay(2000); // awaiting delaying the request to process.
    let { email } = req.body;
    if (!email) {
      res
        .status(400)
        .send({ status: "error", message: isRequiredMessage("Email") });
    } else {
      const user = await User.findOne({
        where: {
          email: email || null,
        },
      });
      if (!user) {
        return res.status(200).send({
          status: "ok",
          message:
            "If your email matches the registered email. You will get an email to reset your password.",
          data: [],
        });
      }

      const generatedToken = await requestPasswordReset(email);
      console.log(generatedToken);
      const mailOptions = {
        from: "expenseshareauth@gmail.com", // Sender address
        to: user.email, // List of receivers
        subject: "Reset Password", // Subject line
        template: "resetPassword", // The template name
        context: {
          // Data to be sent to Handlebars template
          userEmail: email,
          resetLink:
            process.env.RESETPASSWORDLINK ||
            "http://localhost:3030/reset-password",
          resetKey: generatedToken,
        },
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(getResponseBody("error", error.message));
        }
        return res
          .status(200)
          .send(
            getResponseBody(
              "ok",
              "If your email matches the registered email. You will get an email to reset your password."
            )
          );
      });
    }
  } catch (error) {
    res.status(500).send({ status: "error", message: "Something went wrong." });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    await delay(2000);
    let { email, token, password } = req.body;
    if (!email) {
      res
        .status(400)
        .send({ status: "error", message: isRequiredMessage("Email") });
    } else {
      const data = await changePassword(token, password);
      console.log(data);
      return res
        .status(200)
        .send({ status: "ok", message: "Password Updated successfull." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: error.message,
      data: error.message,
    });
  }
};
