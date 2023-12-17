const db = require("../models");
const Skill = db.skill;
const isRequiredMessage = require("../util/validateRequest");
exports.addSkill = (req, res) => {
// console.log("OKAY")
// type 1 is for tecnical and 2 for additional skill 
  let { type, name} = req.body;
  if (!type || !name) {
    res.send({ status: "error", message: isRequiredMessage('Name, Type') });
  }

else{
    // if no any personal info was saved before
// if personal info is saved update it 
Skill.create({
   ...req.body
}).then((data)=>{
    return res.send({status:"ok",message:"Data saved successfull."})
}).catch(err=>{
    res.send({status:"error",message:err})
  })
  }
};

exports.getSkills=(req,res)=>{
  Skill.findAll({
  })
    .then(data => {
      if (!data) {
        // status(404)
        return res.send({ status: "error", message: "No any data available ",data:data });
      }
      else{
          return res.send({status:"ok",data:data});
      }
    
    }
    )
}
exports.deleteSkill=(req,res)=>{
    const {id}=req.query;
    if(!id){
        res.send({status:"error",message:"Id is required."})
    }
    Skill.destroy({
        where: {
          id: id
        }
      }).then((task)=>{
        // console.log("this is got in task",task);
        res.send({status:"ok",message:"Successfully deleted."});
      })
}