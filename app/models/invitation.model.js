const Sequelize = require('sequelize');
module.exports = (sequelize) => {
    const Invitation = sequelize.define("invitations", {
        userEmail: {
            type: Sequelize.STRING(1000),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "UserEmail is required."
                },
                notNull: {
                    msg: 'User Email cannot be null'
                }
            }
        },
        invitedBy: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "InvitedBy is required."
                },
                notNull: {
                    msg: 'InvitedBy cannot be null'
                }
            }
        },
        groupId: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Group Id is required."
                },
                notNull: {
                    msg: 'Group Id cannot be null'
                }
            }
        },
        joinStatus: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Join Status is required."
                },
                notNull: {
                    msg: 'Join Status cannot be null'
                }
            }
        }
    });

    return Invitation;
};