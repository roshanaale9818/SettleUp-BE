const db = require("../models");
const User = db.user;
const Group = db.group; //group model
const delay = require('./../util/helper');
const { getResponseBody } = require('./../util/util');
const Member = db.member;
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAILPASSWORD // Your email password
  }
});

// Configure Handlebars options
transporter.use('compile', hbs({
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.resolve('./app/views/email/'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./app/views/email/'),
  extName: '.hbs',
}));

// create group 
exports.createGroup = async (req, res) => {
  await delay(3000); // delaying for some seconds
  try {
    const reqBody = {
     ...req.body,
     createdBy:req.userId,
     status:'1',
     imgUrl:'',
     remarks:""     
    };
    //finding the creator from database
    const user= await User.findOne({where:{
      id:req.userId
    }})
    if(!user){
      res.status(400).send(getResponseBody('error','Cannot find user database.'))
    }
    const result = await Group.create({
      ...reqBody,
      Members:[{
        userId:req.userId,
        memberName:user.firstName,
        isAdmin:1,
        status:'1'
      }]
     
    },  {
      include:[Member]
    })
    // console.log("THIS IS RESULT",result);
    res.status(200).send(getResponseBody('ok','Group created successfull',result))

  }
  catch (error) {
    // console.log("errr",err.message)
    if (error.name === 'SequelizeValidationError' || error.name ===
      'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ status: "error", errors });
    }
    else {
      res.status(500).send(getResponseBody('error', error.message, []));

    }
  }
}

// get group list with members with the token and user 
exports.getGroupList = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  try {
    const { count, rows } = await Group.findAndCountAll(
     {
      include:[ {
        model:Member,
        where:{
            userId:String(req.userId)
        },
        attributes:{
          exclude:['group_members']
        }
      
      }],
      limit,
      offset: (page - 1) * limit,
      attributes:{
        exclude:['createdBy']
      }
     }
    );

    res.status(200).json({
      totalItems: count,
      data: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).send(getResponseBody('error',error.message,[]));
  }
}


// invite to the group 
exports.inviteToGroup = async (req,res)=>{
    try{
      const {userEmail, groupId}= req.body;
      if(!userEmail){
        return res.status(400).send(getResponseBody('error','User email is required.',[]))
      }
      else if (!groupId){
       return res.status(400).send(getResponseBody('error','Group Id is required.',[]))
    
      }
      const group = await Group.findOne({
        where:{
          id:groupId || null
        }
      });
      // inviting user 
      const user = await User.findOne({
        where:{
          id:req.userId
        }
      });
      // console.log(user.firstName)
       const mailOptions = {
        from: 'expenseshareauth@gmail.com', // Sender address
        to: userEmail, // List of receivers
        subject: 'Group Invitation', // Subject line
        template: 'invitation', // The template name
        context: { // Data to be sent to Handlebars template
          inviteTo: userEmail,
          groupName: group.groupName,
          invitedBy:user.firstName,
          invitationLink: 'http://roshanaalemagar.com:3000'
        }
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(getResponseBody('error',error.message));
        }
        res.status(200).send(getResponseBody('ok','Invitation sent successfully!'));
      });
    }
    catch(err){
      console.log(err)
      return res.status(500).send(getResponseBody('error',err.message));

    }
}

exports.updateGroup = async (req,res)=>{
  await delay(3000); // delaying for some seconds
  try {
    const {groupId,groupName}= req.body;
    if(!groupId){
      return res.status(400).send(getResponseBody('error','Group Id cannot be null', []))
    }


    //finding the creator from database
    const result = await Group.update({
      groupName,
    
    },  {
      where:{
        id:groupId,
        createdBy:req.userId
      }
     
    })
    // console.log("THIS IS RESULT",result);
   if(!result){
    return res.status(400).send(getResponseBody('error','Group updated failed',result))
   }
   return res.status(200).send(getResponseBody('ok','Group updated successfull'))


  }
  catch (error) {
    // console.log("errr",err.message)
    if (error.name === 'SequelizeValidationError' || error.name ===
      'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ status: "error", errors });
    }
    else {
      res.status(500).send(getResponseBody('error', error.message, []));
    }
  }

}