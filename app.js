const express = require('express');
const app = express();
const path = require('path');
const https = require('https')
let cors = require('cors')
app.use(cors());  // If using Express

// app.use(cors());
app.use(express.json()); // Built-in middleware for parsing JSON
app.use(express.urlencoded({ extended: true })); // Built-in middleware for parsing URL-encoded data
const sequelize = require('./util/database');
const Chatuser = require('./models/chatuser');
const adminRoutes = require('./routes/chat');
const Messages = require('./models/messages');
const Groups = require('./models/groups');
app.use(express.static(path.join(__dirname, 'public')));
app.use(adminRoutes);



Messages.belongsTo(Chatuser, { foreignKey: 'chatuserId' })

Chatuser.hasMany(Messages, { foreignKey: 'chatuserId' })

Chatuser.belongsToMany(Groups, { through: 'UserGroups' });
Groups.belongsToMany(Chatuser, { through: 'UserGroups' });


sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });