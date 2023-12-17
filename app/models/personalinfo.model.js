module.exports = (sequelize, Sequelize) => {
    const PersonalInfo = sequelize.define("personalinfos", {
        address: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false

        },
        phone: {
            type: Sequelize.STRING,
            allowNull: false
        },
        education: {
            type: Sequelize.STRING,
            allowNull: false

        },

    });

    return PersonalInfo;
};