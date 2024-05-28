'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'imgUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'imgUrl');
  }
};

// npx sequelize-cli db:migrate --config D:\SettleUp\Backend\app\config\config.js
