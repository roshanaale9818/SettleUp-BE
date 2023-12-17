module.exports = (sequelize, Sequelize) => {
    const Skill = sequelize.define("skill", {
        type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false

        }
    });

    return Skill;
};