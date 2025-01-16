const path = require('path');

const express = require('express');

const chatcontroller = require('../controllers/chat');

const router = express.Router();

//main signup page
router.get('/sign', chatcontroller.baserootsignup);
router.post('/signup', chatcontroller.signup)

module.exports = router
