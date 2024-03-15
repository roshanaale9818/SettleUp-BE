const db = require("../models");
const User = db.user;
const isRequiredMessage = require("../util/validateRequest");
const delay = require('./../util/helper');
const { getResponseBody } = require('./../util/util')

// create group 
exports.createGroup = async (req, res) => {
    await delay(3000); // delaying for some seconds
    try {
        hello;
    }
    catch (err) {
        // console.log("errr",err.message)
        res.status(500).send(getResponseBody('error', err.message, []));
    }
}
