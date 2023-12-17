module.exports = (sequelize, Sequelize) => {
    const Home = sequelize.define("home", {
        address: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false

        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false

        },
        job_designation: {
            type: Sequelize.STRING,
            allowNull: false

        },
        short_description: {
            type: Sequelize.STRING,
            allowNull: false

        },
        greeting: {
            type: Sequelize.STRING,
            allowNull: false

        },

    });

    return Home;
};