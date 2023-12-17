const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const CORS = require('./app/util/corsOptions');
const directory = __dirname;
exports.dir = directory;


//create the app for rest api using express
const app = express();
var corsOptions = [...CORS] 

// use the cors body parser in express app 
app.use(cors(corsOptions));
app.use(bodyParser.json());// parsing requesting content type to application/json 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
// making upload folder static for accessing 
app.use('/uploads', express.static('uploads'));
app.get("/",(req,res)=>{
    res.json({status:"ok",message:"Welcome to Node js app."});

});


const PORT = process.env.PORT || 8080;//setting up the ports for application
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});
const db = require('./app/models/index');

const Role = db.role;
const routes = require('./app/routes/main.routes');
routes(app);



// force true should be removed for production environment
// {force:true}
db.sequelize.sync().then(()=>{
    // console.log("Drop and Resync Db");
    initial(); // creates 3 rows in database
})
const initial = ()=> {
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




//   const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
// const customCss = fs.readFileSync((process.cwd()+"/swagger.css"), 'utf8');
// let express to use this
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {}));
