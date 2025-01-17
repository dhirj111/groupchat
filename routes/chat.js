const path = require('path');

const express = require('express');

const chatcontroller = require('../controllers/chat');

const router = express.Router();

//main signup page
router.get('/sign', chatcontroller.baserootsignup);
router.post('/signup', chatcontroller.signup)


router.get('/login', chatcontroller.baserootlogin);

router.post('/login', chatcontroller.login)

router.get('/chatwindow', chatcontroller.chatwindow)

router.post('/messagesubmit', chatcontroller.messagessubmit)
module.exports = router
