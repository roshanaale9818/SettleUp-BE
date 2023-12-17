const db = require("../models");
const User = db.user;
exports.getAllUser=(req,res)=>{

User.findAll(
    {
        //for setting up the DTO
        // we dont want to send all the fields from database such as password to user
        attributes:['id','username','email','createdAt','firstName','lastName','state','address','contact']
    }
).then((users)=>{
  
    // console.log("users",users)
   if(users && users.length > 0){
    //send the transaltion
    res.send({status:"ok",data:users});
}else{
    // if no users we send the no users found 
    res.send({status:"error",message:"No users found",data:[]});
}
})
}