const express = require("express");
require('dotenv/config') 
const bodyParser = require("body-parser");
const cors = require("cors");
const CORS = require('./app/util/corsOptions');
const routes = require('./app/routes/main.routes');
const directory = __dirname;
exports.dir = directory;
//create the app for rest api using express
const app = express();
let corsOptions = [...CORS] 

// use the cors body parser in express app 
app.use(cors(corsOptions));
app.use(bodyParser.json());// parsing requesting content type to application/json 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.get("/",(req,res,next)=>{
    res.json({status:"ok",message:"Node js is running."});
    next();

});

const PORT = process.env.PORT || 8080;//setting up the ports for application
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});
const db = require('./app/models/index');
const Role = db.role;
//configuring the routes
routes(app);



// force true should be removed for production environment
// let dev = process.env.MODE || "TEST";
// {force:true}
db.sequelize.sync().then(()=>{
    console.log("database created");
    initial(); // creates 3 rows in database
})
const initial = async ()=> {
  try{
   const rolesList = await Role.findAll();
   if(!rolesList || rolesList.length == 0){
    console.log("CREATING ROLES")
    Role.create({
      id: 1,
      name: "user"
    });
   
    Role.create({
      id: 2,
      name: "moderator"
    });
   
    Role.create({
      id: 3,
      name: "admin"
    });
   }
  }
  catch(err){
    console.log("Error has occured in initial creation.")
  }

}



