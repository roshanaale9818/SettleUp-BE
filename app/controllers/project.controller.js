const db = require("../models");
const Project = db.project;
const isRequiredMessage = require("../util/validateRequest");
exports.addProject = (req, res) => {
// console.log("OKAY")
  let { description, name} = req.body;
  if (!description || !name) {
    res.send({ status: "error", message: isRequiredMessage('Name, Description') });
  }

else{
    // if no any personal info was saved before
// if personal info is saved update it 

Project.create({
   ...req.body
}).then((data)=>{
    return res.send({status:"ok",message:"Data saved successfull."})
}).catch(err=>{
    res.send({status:"error",message:err})
  })
  }
};

exports.getProjects=(req,res)=>{
  Project.findAll({
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
    ).catch(err=>{
        res.send({status:"error",message:err})
      })
}

exports.updateProject=(req,res)=>{
    const {id}=req.body;
    Project.findAll({
        id:id || null
    })
      .then(data => {
        if (!data) {
          // status(404)
          return res.send({ status: "error", message: "No any data available ",data:data });
        }
        else{
           Project.update({
            ...req.body
           },{where:{
            id:id
           }})

           return res.send({status:"ok",message:"Updated successfull."})
        }
      
      }
      ).catch(err=>{
        res.send({status:"error",message:err})
      })
  }



exports.deleteProject=(req,res)=>{
    const {id}=req.query;
    if(!id){
        res.send({status:"error",message:"Id is required."})
    }
    Project.destroy({
        where: {
          id: id
        }
      }).then((task)=>{
        // console.log("this is got in task",task);
        res.send({status:"ok",message:"Successfully deleted."});
      })
}