const db = require("../models");
// const config = require("../config/auth.config");
// const User = db.user;
const PersonalInfo = db.personalInfo;
const isRequiredMessage = require("../util/validateRequest");
exports.savePersonalInfo = (req, res) => {
// console.log("OKAY")
  let { address, email, phone,education } = req.body;
  if (!address) {
    res.send({ status: "error", message: isRequiredMessage('Address') });
  }
  else if (!email) {
    res.send({ status: "error", message: isRequiredMessage('Email') });
  }
  else if (!phone) {
    res.send({ status: "error", message: isRequiredMessage('Phone') });
  }
  else if (!education) {
    res.send({ status: "error", message: isRequiredMessage('Education') });
  }


else{
    // if no any personal info was saved before
// if personal info is saved update it 
PersonalInfo.findAll({})
  .then(data => {
    console.log("data",data)
    if (data.length == 0) {
        console.log("CREATE")
        // create  
        PersonalInfo.create({
            address:address,
            email:email,
            education:education,
            phone:phone
        }).then((personalinfo)=>{
            return res.send({status:"ok",message:"Data saved successfull."})
        })
    }
    else{
        console.log("UPDATE");
        PersonalInfo.update({
            address:address,
            email:email,
            education:education,
            phone:phone
        },{where:{
            id:data[0].dataValues.id
        }}).then((personalinfo)=>{
            return res.send({status:"ok",message:"Data saved successfull."})
        })

        // update the info  
        // return res.send({status:"ok",data:messages});
    }
  
  }
    
  ).catch(err=>{
    res.send({status:"error",message:err})
  })

  }
};

exports.getPersonalInfo=(req,res)=>{
  // let { username,password } = req.body;

  PersonalInfo.findAll({

  })
    .then(data => {
      // console.log("USER",user)
      if (!data) {
        // status(404)
        return res.send({ status: "error", message: "No any data available ",data:data });
      }
      else{
          return res.send({status:"ok",data:data[0]});
      }
    
    }
      
    )




}