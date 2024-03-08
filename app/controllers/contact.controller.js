const db = require("../models");
// const config = require("../config/auth.config");
// const User = db.user;
const Contact = db.contact;
// var jwt = require("jsonwebtoken");
// var bcrypt = require("bcryptjs");
const isRequiredMessage = require("../util/validateRequest");

exports.createContactMessage = (req, res) => {
// console.log("OKAY")
  let { name, email, subject,message } = req.body;
  if (!name) {
    res.send({ status: "error", message: isRequiredMessage('Name') });
  }
  else if (!email) {
    res.send({ status: "error", message: isRequiredMessage('Email') });
  }
  else if (!message) {
    res.send({ status: "error", message: isRequiredMessage('Message') });
  }
  else if (!subject) {
    res.send({ status: "error", message: isRequiredMessage('Subject') });
  }


else{  
  // Save User to Database
  Contact.create({
    name: name,
    email: email,
   message:message,
   subject:subject
  })
    .then(contact => {
        // if created send success message  
        res.send({ status: "ok", message: "Message submitted successfull." });
    
    })
    .catch(err => {
      res.status(500).send({ status: "error", message: err.message });
    });

  }
};

exports.getContactMessage=(req,res)=>{
  // let { username,password } = req.body;

  Contact.findAll({

  })
    .then(messages => {
      // console.log("USER",user)
      if (!messages) {
        // status(404)
        return res.send({ status: "error", message: "No any messages",data:messages });
      }
      else{
          return res.send({status:"ok",data:messages});
      }
    
    }
      
    )




}