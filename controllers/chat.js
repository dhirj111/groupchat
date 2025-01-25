
const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const { Op } = require("sequelize");

const Chatuser = require('../models/chatuser');
const Messages = require('../models/messages')
const Groups = require('../models/groups')
const router = require('../routes/chat');
const UserGroup = require('../models/usergroup')
console.log("U s e r G r o u p  ", UserGroup)
const { route } = require('../routes/chat');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { group } = require('console');


function generateAccessToken(id, name) {

  return jwt.sign({ userId: id, name: name }, process.env.TOKEN_SECRET);
}
//main signup page
exports.baserootsignup = (req, res, next) => {
  console.log("Serving htmlmain.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
}
exports.chatwindow = (req, res, next) => {
  console.log("Serving htmlmain.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'chatwindow.html'));
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
            usertoken: generateAccessToken(existingUser.id, existingUser.name),
            code: "userverified",
            message: "user logged in succesfully",
            urltoredirect: 'http://localhost:3000/chatwindow'
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
    console.log("inside catch  block of controller err is ==", err);
    res.status(500).json({
      error: " user does not exist",
      message: err.message
    });
  }
}

exports.messagessubmit = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    // console.log("Received data at /appointmentData");
    // console.log("user attached with req of middleware", req.user.id, " ", req.body.user);
    console.log("user attached with req of middleware", req.user.id);
    const msg = req.body.msg;
    const group = req.body.groupId
    console.log("   msg     group 56666 5665 5   ", msg, group)
    await Messages.create({
      msg: msg,
      name: req.user.name,
      chatuserId: req.user.id,
      groupId:group

    }, { transaction: t });

    // Commit transaction
    await t.commit();

    // Send success response
    return res.status(201).json({
      name: req.user.name,
      message: "message recorded successfully",
      // expense: newExpense,
      // currentBalance: newTotal
    });

  } catch (err) {
    // Rollback transaction on error
    await t.rollback();

    console.error('Error creating msg:', err);

    // Send appropriate error response
    return res.status(500).json({
      error: "Failed to record expense",
      details: 'Internal server error'
    });
  }
};


exports.fetchmessages = async (req, res, next) => {
  let lastid = req.params.id;

  const groupId = req.header('groupId');

  console.log(lastid, "last id here ")
  await Messages.findAll({
    where: {
      id: {
        [Op.gt]: lastid, // Condition: id > 0
      },
      groupId: groupId
    },
  }).then(messages => {
    let change = true;
    if (messages.length == 0) {
      change = false;
    }
    console.log(messages)
    res.json({
      messages: messages,
      change: change
    })
  })
}

exports.creategroup = async (req, res, next) => {
  console.log("hitted creategroup")
  console.log(req.body.groupname);
  console.log("user attached with req of middleware", req.user.id);
  const t = await sequelize.transaction();
  try {

    const newGroup = await Groups.create({
      name: req.body.groupname,
      creator: req.user.id,


    }, { transaction: t });

    await newGroup.addChatuser(req.user.id, { transaction: t });
    // Commit transaction
    await t.commit();

    // Send success response
    return res.status(201).json({
      message: "group created successfully",

    });

  } catch (err) {
    // Rollback transaction on error
    await t.rollback();

    console.error('Error creating msg:', err);

    // Send appropriate error response
    return res.status(500).json({
      error: "Failed to record expense",
      details: 'Internal server error'
    });
  }
};

exports.fetchgroups = async (req, res) => {

  Groups.findAll().then((groups) => {

    res.status(201).json({
      groups: groups
    });


  })


}

exports.joinstatus = async (req, res) => {
  console.log("000222"); // This should print to confirm the route is being hit
  console.log(" join      status         consoles        1020 ", req.body.groupId, req.user.id)
  const groupId = req.body.groupId; // Assuming you pass these in the request body
  const userId = req.user.id

  try {
    let ismember = true
    const usergroup = await UserGroup.findOne({
      where: {
        chatuserId: userId,
        groupId: groupId
      }
    })
    if (!usergroup) {

      ismember = false
    }
    res.status(201).json({
      groupdetails: ismember
    });

  } catch (error) {
    console.error("Error checking user group membership:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.joinbutton = async (req, res) => {
  try {
    const groupId = req.body.groupId; // Assuming you pass these in the request body
    const userId = req.user.id
    await UserGroup.create({
      chatuserId: userId,
      groupId: groupId


    });
    res.status(201).json({
      groupdetails: "user is added to group"
    });
  } catch (error) {
    console.error("Error checking user group membership:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}