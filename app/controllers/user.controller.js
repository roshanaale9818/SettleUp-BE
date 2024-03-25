const util = require("../util/util");

const db = require("../models");
const { Op } = require('sequelize');
const User = db.user;
exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.findUsers = async (req, res) => {
  {
    const { search } = req.query;
    try {
      let users = await User.findOne({
        where: {
          email: {
            [Op.eq]: search
          }
        },
        attributes: {
          exclude: ['password']
        }
      });
      //  if(!users) {
      //   users = await User.findAll({
      //     where: {
      //       [Op.or]: [
      //         {
      //           firstName: {
      //             [Op.like]: `%${search}%`
      //           }
      //         },
      //         {
      //           email: {
      //             [Op.eq]: `%${search}%`
      //           }
      //         },
      //         { status: "1" }
      //       ],
      //     },
      //     attributes: {
      //       exclude: ['password']
      //     }
      //   });}

      if (users) {
        return res.status(200).send(util.getResponseBody('ok', 'User not found', users));
      }
      return res.status(200).send(util.getResponseBody('ok', 'User Not found', []));
    } catch (error) {
      res.status(500).send(util.getResponseBody('error', error.message));
    }
  }
}
