const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Chatuser = sequelize.define('chatuser', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING(45),  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  email: {
    type: Sequelize.STRING(45),  // Matches table VARCHAR(45)
    allowNull: false  // Matches NULL constraint in table
  },
  password: {
    type: Sequelize.STRING,  // Matches table VARCHAR(45)
    allowNull: false // Matches NULL constraint in table
  },
  phone: {
    type: Sequelize.INTEGER,  // Matches table VARCHAR(45)
    allowNull: false //
  }
}
);

module.exports = Chatuser;