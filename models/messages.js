const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Messages = sequelize.define('messages', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  msg: {
    type: Sequelize.STRING,  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  groupId: {
    type: Sequelize.STRING,
    allowNull: false
  }
}
);

module.exports = Messages;