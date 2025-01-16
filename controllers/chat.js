
const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Chatuser = require('../models/chatuser');
const router = require('../routes/chat');
const { route } = require('../routes/chat');
const path = require('path');
const bcrypt = require('bcrypt');


//main signup page
exports.baserootsignup = (req, res, next) => {
  console.log("Serving htmlmain.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
}


