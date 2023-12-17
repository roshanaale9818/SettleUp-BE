module.exports = (sequelize, Sequelize) => {
    const Contact = sequelize.define("contacts", {
  
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      subject: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },

    });
  
    return Contact;
  };