const express = require('express');
const app = express();
const path = require('path');
const https = require('https')
// app.use(cors());
app.use(express.json()); // Built-in middleware for parsing JSON
app.use(express.urlencoded({ extended: true })); // Built-in middleware for parsing URL-encoded data
const sequelize = require('./util/database');
const Chatuser = require('./models/chatuser');
const adminRoutes = require('./routes/chat');
app.use(express.static(path.join(__dirname, 'public')));
app.use(adminRoutes);
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