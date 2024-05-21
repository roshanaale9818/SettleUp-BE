module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Email is required.",
        },
        notNull: {
          msg: "Email cannot be null",
        },
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password is required.",
        },
        notNull: {
          msg: "Password cannot be null",
        },
      },
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "First name is required.",
        },
        notNull: {
          msg: "First name cannot be null",
        },
      },
    },
    middleName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Last Name cannot be null",
        },
        notEmpty: {
          msg: "Last name is required.",
        },
      },
    },
    contact: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Contact cannot be null",
        },
        notEmpty: {
          msg: "Contact is required.",
        },
      },
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    remarks: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    postalCode: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Postal code cannot be null",
        },
        notEmpty: {
          msg: "Postal Code is required.",
        },
      },
    },
    country: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Country cannot be null",
        },
        notEmpty: {
          msg: "Country is required.",
        },
      },
    },
    isVerified: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    street: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Street cannot be null",
        },
        notEmpty: {
          msg: "Street is required.",
        },
      },
    },
    imgUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });

  return User;
};
