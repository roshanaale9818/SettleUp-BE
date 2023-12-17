module.exports = (sequelize, Sequelize) => {
    const SocialMedia = sequelize.define("socialmedia", {
        url: {
            type: Sequelize.STRING,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false

        },
        icon: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    return SocialMedia;
};