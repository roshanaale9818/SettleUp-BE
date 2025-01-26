"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("settlement", "groupId", {
      type: Sequelize.INTEGER,
      allowNull: false, // Adjust based on your requirements
      references: {
        model: "group", // Name of the target table
        key: "id", // Key in the target table
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Settlements", "groupId");
  },
};
