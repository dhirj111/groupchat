const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Usergroups = sequelize.define('usergroups', {
  chatuserId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Usergroups;