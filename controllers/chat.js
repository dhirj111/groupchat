
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
      groupId: group

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

    const newgroup = await Groups.create({
      name: req.body.groupname,
      creator: req.user.id,

    }, { transaction: t });

    console.log(newgroup.id, "is new group created rn")
    await UserGroup.create({
      chatuserId: req.user.id,
      groupId: newgroup.id,
      isadmin: true,

    }, { transaction: t });

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
      groupId: groupId,
      isadmin: false


    });
    res.status(201).json({
      groupdetails: "user is added to group"
    });
  } catch (error) {
    console.error("Error checking user group membership:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}


exports.adminsettings = async (req, res, next) => {
  const chatuserId = req.user.id;
  const groupId = req.body.groupid

  try {
    // Extract chatuserId and groupId from the request body

    // Validate input
    // if (!chatuserId || !groupId) {
    //   return res.status(400).json({ message: 'Invalid request. Missing chatuserId or groupId.' });
    // }

    // Fetch the user group relationship
    const userGroup = await UserGroup.findOne({
      where: { chatuserId, groupId },
    });

    // Check if the user exists in the group
    // if (!userGroup) {
    //   return res.status(404).json({ message: 'User not found in the specified group.' });
    // }

    // Check if the user is an admin
    if (userGroup.isadmin) {
      // Send adminaccess.html if the user is an admin

      res.status(201).json({
        groupid: groupId
      });

    } else {
      // Respond with a message if the user is not an admin
      return res.status(403).json({ message: 'You are not an admin.' });
    }
  } catch (error) {
    console.error('Error in adminsettings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


exports.loadGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const currentUserId = req.user.id;

    // Check if current user is in the group
    const currentUserGroupRole = await UserGroup.findOne({
      where: { groupId: groupId, chatuserId: currentUserId }
    });
    console.log(currentUserGroupRole, "   is      currentUserGroupRole")
    if (!currentUserGroupRole) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Find all users in the group
    const groupMembers = await UserGroup.findAll({
      where: { groupId: groupId },
      include: [{
        model: Chatuser,
        attributes: ['id', 'name']
      }]
    });
    console.log(groupMembers, "are groupMembers")
    const membersDetail = groupMembers.map(member => ({
      id: member.chatuserId,
      name: member.chatuser.name
    }));
    console.log(membersDetail, "are groupMembers  22 ")
    res.status(200).json({ members: membersDetail });
  } catch (error) {
    console.error('Error loading group members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





exports.removeMember = async (req, res) => {
  console.log("reached remove member admin  ctrl")
  try {
    const { groupId, memberId } = req.body;
    const currentUserId = req.user.id;

    // Check if current user is admin
    const currentUserGroupRole = await UserGroup.findOne({
      where: {
        groupId: groupId,
        chatuserId: currentUserId,
        isadmin: true
      }
    });

    if (!currentUserGroupRole) {
      return res.status(403).json({
        message: 'Only group admins can remove members'
      });
    }

    // Remove member from group
    const removedMember = await UserGroup.destroy({
      where: {
        groupId: groupId,
        chatuserId: memberId
      }
    });

    if (removedMember === 0) {
      return res.status(404).json({
        message: 'Member not found in group'
      });
    }

    res.status(200).json({
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.makeMemberAdmin = async (req, res) => {
  console.log("reached make member admin  ctrl")
  try {
    const { groupId, memberId } = req.body;
    const currentUserId = req.user.id;

    // Check if current user is admin
    const currentUserGroupRole = await UserGroup.findOne({
      where: {
        groupId: groupId,
        chatuserId: currentUserId,
        isadmin: true
      }
    });

    if (!currentUserGroupRole) {
      return res.status(403).json({
        message: 'Only group admins can promote members'
      });
    }

    // Update member's admin status
    const [updatedRows] = await UserGroup.update(
      { isadmin: true },
      {
        where: {
          groupId: groupId,
          chatuserId: memberId
        }
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        message: 'Member not found in group'
      });
    }

    res.status(200).json({
      message: 'Member promoted to admin successfully'
    });
  } catch (error) {
    console.error('Error making member admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addGroupMember = async (req, res) => {
  try {
    const { email, groupId } = req.body;
    const currentUserId = req.user.id;

    // Check if current user is admin of the group
    const currentUserGroupRole = await UserGroup.findOne({
      where: { 
        groupId: groupId, 
        chatuserId: currentUserId,
        isadmin: true
      }
    });

    if (!currentUserGroupRole) {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can add members' 
      });
    }

    // Find user by email
    const userToAdd = await Chatuser.findOne({
      where: { email: email }
    });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    // Check if user is already in group
    const existingMember = await UserGroup.findOne({
      where: {
        groupId: groupId,
        chatuserId: userToAdd.id
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }

    // Add user to group
    await UserGroup.create({
      chatuserId: userToAdd.id,
      groupId: groupId,
      isadmin: false // New members are not admins by default
    });

    res.status(200).json({
      success: true,
      message: 'Member added successfully'
    });

  } catch (error) {
    console.error('Error adding group member:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};