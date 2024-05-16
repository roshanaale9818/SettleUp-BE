const express = require("express");
require("dotenv/config");
const limiter = require("express-rate-limit");
const bodyParser = require("body-parser");
const cors = require("cors");
const CORS = require("./app/util/corsOptions");
const routes = require("./app/routes/main.routes");
const directory = __dirname;
exports.dir = directory;
//create the app for rest api using express
const app = express();
const rateLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: "Too many requests from this IP, please try again later",
  // store: ... , // Redis, Memcached, etc. See below.
});
// middleware
// app.use(rateLimiter);
let corsOptions = [...CORS];

// use the cors body parser in express app
app.use(cors(corsOptions));
app.use(bodyParser.json()); // parsing requesting content type to application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res, next) => {
  res.json({ status: "ok", message: "Node js is running." });
  next();
});

const PORT = process.env.PORT || 8080; //setting up the ports for application
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const db = require("./app/models/index");
const Role = db.role;
//configuring the routes
routes(app);

// force true should be removed for production environment
// let dev = process.env.MODE || "TEST";
// {force:true}
db.sequelize.sync().then(() => {
  console.log("database created");
  initial(); // creates 3 rows in database
});
const initial = async () => {
  try {
    const rolesList = await Role.findAll();
    if (!rolesList || rolesList.length == 0) {
      console.log("CREATING ROLES");
      Role.create({
        id: 1,
        name: "user",
      });

      Role.create({
        id: 2,
        name: "moderator",
      });

      Role.create({
        id: 3,
        name: "admin",
      });
    }
  } catch (err) {
    console.log("Error has occured in initial creation.");
  }
};
