
const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Chatuser = require('../models/chatuser');
const router = require('../routes/chat');
const { route } = require('../routes/chat');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken')
function generateAccessToken(id, isPremiumUser) {

  return jwt.sign({ userId: id }, process.env.SECRET_KEY);
}
//main signup page
exports.baserootsignup = (req, res, next) => {
  console.log("Serving htmlmain.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
}


exports.signup = async (req, res, next) => {
  const t = await sequelize.transaction();
  const saltRounds = 10;
  //salt is an string/whatver added to  password which increases randomness of password
  //even for same password each time to increase safety
  try {
    const { name, email, phone, password } = req.body;

    // Check if user with email already exists
    const existingUser = await Chatuser.findOne({
      where: { email: email }
    }, { transaction: t });

    if (existingUser) {
      console.log('Account already exists for email:', email);
      await t.rollback();
      return res.status(409).json({
        error: "Account already exists",
        message: "An account with this email already exists"
      });
    }

    // If email doesn't exist, create new user
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await Chatuser.create(
      {
        name,
        email,
        phone,
        password: hashedPassword,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({
      message: "User created successfully"
    });
  } catch (err) {
    await t.rollback();
    console.error('Error in signup:', err);
    res.status(500).json({
      error: "Failed to process signup",
      details: err.message
    });
  }
};
exports.baserootlogin = (req, res, next) => {
  console.log("Serving login.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
}


exports.login = async (req, res, next) => {
  console.log(req.body)
  try {
    const { email, password } = req.body;

    const existingUser = await Chatuser.findOne({
      where: { email: email }
    });
    if (existingUser) {
      bcrypt.compare(password, existingUser.password).then(function (result) {

        if (result) {
          return res.status(201).json({
            usertoken: generateAccessToken(existingUser.id, existingUser.isPremiumUser),
            code: "userverified",
            message: "user logged in succesfully",
            urltoredirect: 'https://localhost:3000/logged'
          });
        }
        else {
          return res.status(401).json({
            message: "password is incorrect"
          })
        };
      });

    }
    else {
      res.status(404).json({
        message: " user does not exist",
      });
    }
  }
  catch (err) {
    //this block is for eror in exceution of try blocks as a 
    // whole, catch does not care about individual error of logic
    console.log("inside catch  block of controller err is ==", err);
    res.status(500).json({
      error: " user does not exist",
      message: err.message
    });
  }
}
