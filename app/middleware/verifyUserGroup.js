const delay = require("../util/helper");
const db = require("../models");
const { getResponseBody } = require("../util/util");
// const User = db.user;
const Group = db.group;

// validate the unique emails 
verifyUserIsInGroup = async(req, res, next) => {
    await delay(3000)
     try {
       // Email
       const group = Group.findAll({
        include:[ {
            model:Member,
            where:{
                userId:String(req.userId),
                id:String(req.body.groupId)
            },
            attributes:{
              exclude:['group_members']
            }
          
          }]
       });
       if(!group){
        res.status(400).send(getResponseBody('error',"Non group member cannot invite user in this group."))
       }
       next();

   
         

     }
     catch (error) {
       console.log("Something went wrong")
       res.status(400).json({ status: "error", message: error.message })
     }
   };