const path = require("path");
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require("dotenv").config({ path: path.resolve(__dirname, envFile) });
// Log to verify environment variables are loaded correctly
console.log("Database Host:", process.env.HOST);
console.log("Database User:", process.env.USER);
console.log("Database Name:", process.env.DB);
console.log("Environment:", process.env.NODE_ENV);
module.exports = {
  development: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
  },
  test: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
  },
  production: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
  },
};

// npx sequelize-cli db:migrate --config C:\Users\rosha\Projects\ExpenseShare\BackEnd\SettleUp-BE\app\config\config.js
