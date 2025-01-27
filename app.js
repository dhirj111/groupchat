const express = require('express');
const app = express();
const path = require('path');
const http = require('http'); // Use HTTP for Socket.IO
const cors = require('cors');
const socketIo = require('socket.io'); // Import Socket.IO
const sequelize = require('./util/database');
const Chatuser = require('./models/chatuser');
const adminRoutes = require('./routes/chat');
const Messages = require('./models/messages');
const Groups = require('./models/groups');
const UserGroup = require('./models/usergroup');

// Middleware
app.use(cors());
app.use(express.json()); // Built-in middleware for parsing JSON
app.use(express.urlencoded({ extended: true })); // Built-in middleware for parsing URL-encoded data
app.use(express.static(path.join(__dirname, 'public')));
app.use(adminRoutes);

// Database Associations
Messages.belongsTo(Chatuser, { foreignKey: 'chatuserId' });
Chatuser.hasMany(Messages, { foreignKey: 'chatuserId' });
Chatuser.belongsToMany(Groups, { through: 'UserGroups' });
Groups.belongsToMany(Chatuser, { through: 'UserGroups' });
UserGroup.belongsTo(Chatuser, { foreignKey: 'chatuserId' });
Chatuser.hasMany(UserGroup, { foreignKey: 'chatuserId' });

// Create HTTP server and attach Socket.IO
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins (adjust for production)
    methods: ['GET', 'POST'], // Allowed HTTP methods
  },
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a group room
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId); // Join the room for the group
    console.log(`User ${socket.id} joined group: ${groupId}`);
  });

  // Handle new messages
  socket.on('sendMessage', async (data) => {
    const { msg, groupId, userId, userName } = data;

    try {
      // Save the message to the database
      const message = await Messages.create({
        msg: msg,
        name: userName,
        chatuserId: userId,
        groupId: groupId,
      });

      // Emit the message to all users in the group
      io.to(groupId).emit('receiveMessage', message);
      console.log(`Message sent to group ${groupId}:`, message);
    } catch (error) {
      console.error('Error saving or sending message:', error);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Sync database and start the server
sequelize
  .sync()
  .then(() => {
    server.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });