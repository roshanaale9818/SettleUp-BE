const Sequelize = require('sequelize');
module.exports = (sequelize) => {
    const GroupMember = sequelize.define("GroupMember", {
        memberName:{
            type: Sequelize.STRING(1000),
            allowNull: true,
        },
        isAdmin: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, { tableName: 'groupmember' });

    return GroupMember;
};