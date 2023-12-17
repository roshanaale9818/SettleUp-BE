const db = require("../models");
// const config = require("../config/auth.config");
// const User = db.user;
const Home = db.home;
const isRequiredMessage = require("../util/validateRequest");
exports.saveHomeData = (req, res) => {
// console.log("OKAY")
  let { address, email,description,name,job_designation,short_description,greeting } = req.body;
  if (!address ||!email||!description||!name||!job_designation||!short_description||!greeting ) {
    res.send({ status: "error", message: isRequiredMessage('Address, email,description,name,job_designation,short_description,greeting ') });
  }


else{
// if no any personal info was saved before
// if personal info is saved update it 
Home.findAll({})
  .then(data => {
    console.log("data",data)
    if (data.length == 0) {
        // console.log("CREATE")
        // create  
        Home.create({
       ...req.body
        }).then((data)=>{
            return res.send({status:"ok",message:"Data saved successfull."})
        })
    }
    else{
        // console.log("UPDATE");
        Home.update({
         ...req.body
        },{where:{
            id:data[0].dataValues.id
        }}).then((data)=>{
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

exports.getHomeInfo=(req,res)=>{
  // let { username,password } = req.body;

  Home.findAll({

  })
    .then(data => {
      // console.log("USER",user)
      if (!data || data.length == 0) {
        // status(404)
        return res.send({ status: "error", message: "No any data available ",data:data });
      }
      else{
          return res.send({status:"ok",data:data[0]});
      }
    
    }
      
    )




}