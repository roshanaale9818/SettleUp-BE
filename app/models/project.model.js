module.exports = (sequelize, Sequelize) => {
    const Project = sequelize.define("projects", {
        type: {
            type: Sequelize.STRING,
            allowNull: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false

        },
        github_repo_link: {
            type: Sequelize.STRING,
            allowNull: true
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    return Project;
};