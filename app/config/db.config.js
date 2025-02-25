const path = require("path");
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require("dotenv").config({ path: path.resolve(__dirname, envFile) });
// Log to verify environment variables are loaded correctly

module.exports = {
  HOST: process.env.HOST,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DB: process.env.DB,
  dialect: "postgres",
  DB_PORT: process.env.DB_PORT,
  pool: {
    port: 25060,
    min: 0, //min number of connection
    max: 5, //max number of connection
    acquire: 30000, //maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000, //maximum time, in milliseconds, that a connection can be idle before being released
  },
};
