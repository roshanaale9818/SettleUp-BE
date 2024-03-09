module.exports =  (sequelize, Sequelize) => {
  const User =  sequelize.define("users", { 
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate:{
        notNull:{
          msg:'Email cannot be null'
        }
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg:'Password cannot be null'
        }
      }
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg:'First name cannot be null'
        }
      }
    },
    middleName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg:'Middle Name cannot be null'
        }
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg:'Last Name cannot be null'
        }
      }
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg:'Address cannot be null'
        }
      }
    },
    contact: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg:'Contact cannot be null'
        }
      }
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    remarks: {
      type: Sequelize.STRING,
      allowNull: true,
      // validate:{
      //   notNull:{
      //     msg:'Email cannot be null'
      //   }
      // }
    }
  });

return User;
};