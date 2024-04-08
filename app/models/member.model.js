const Sequelize = require('sequelize');
module.exports = (sequelize) => {
    const Member = sequelize.define("Member", {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Member userId is required."
                },
                notNull: {
                    msg: 'Members userId cannot be null'
                }
            }
        },
        memberName: {
            type: Sequelize.STRING(1000),
            allowNull: true,
        },
        isAdmin: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    }, { tableName: 'members' });

    return Member;
};