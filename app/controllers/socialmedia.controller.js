const db = require("../models");
const SocialMedia = db.socialMedia;
const isRequiredMessage = require("../util/validateRequest");
exports.saveSocialMedia = (req, res) => {
// console.log("OKAY")
  let { url, name, icon} = req.body;
  if (!url || !name|| !icon) {
    res.send({ status: "error", message: isRequiredMessage('Name, Url, Icon') });
  }

else{
    // if no any personal info was saved before
// if personal info is saved update it 

SocialMedia.create({
   ...req.body
}).then((data)=>{
    return res.send({status:"ok",message:"Data saved successfull."})
}).catch(err=>{
    res.send({status:"error",message:err})
  })
  }
};

exports.getSocialMedia=(req,res)=>{
  SocialMedia.findAll({
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
exports.deleteSocialMedia=(req,res)=>{
    const {id}=req.query;
    if(!id){
        res.send({status:"error",message:"Id is required."})
    }
    SocialMedia.destroy({
        where: {
          id: id
        }
      }).then((task)=>{
        // console.log("this is got in task",task);
        res.send({status:"ok",message:"Successfully deleted."});
      })
}