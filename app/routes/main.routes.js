const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const contactRoutes = require('./contact.routes');
const personalInfoRoutes = require('./personalinfo.routes');
const socialmediaRoutes = require('./socialmedia.routes');
const skillRoutes =require('./skill.routes');
const projectRoutes=require('./project.routes');
const homeRoutes=require('./home.routes');
// const { uploadResume } = require('../models');
const uploadResume = require('./upload.resume.routes');
const imageUpload = require('./image-upload.routes');

// const { skill } = require('../models');
module.exports =  function(app){
        authRoutes(app);
        // userRoutes(app);
        contactRoutes(app)
        // personalInfoRoutes(app);
        // socialmediaRoutes(app);
        // skillRoutes(app);
        // projectRoutes(app);
        // homeRoutes(app);
        // uploadResume(app);
        imageUpload(app);

};