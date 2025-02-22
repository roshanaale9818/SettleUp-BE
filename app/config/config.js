require("dotenv").config();
module.exports = {
  development: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
  },
  test: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
  },
  production: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
  },
};

// npx sequelize-cli db:migrate --config C:\Users\rosha\Projects\ExpenseShare\BackEnd\SettleUp-BE\app\config\config.js
