const path = require('path');

const express = require('express');

const chatcontroller = require('../controllers/chat');
const auth = require('../middleware/auth');
const router = express.Router();

//main signup page
router.get('/sign', chatcontroller.baserootsignup);
router.post('/signup', chatcontroller.signup)


router.get('/login', chatcontroller.baserootlogin);

router.post('/login', chatcontroller.login)

router.get('/chatwindow', chatcontroller.chatwindow)

router.post('/messagesubmit', auth, chatcontroller.messagessubmit)

router.get('/messages/:id', auth, chatcontroller.fetchmessages)

router.post('/creategroup', auth, chatcontroller.creategroup)


router.get('/fetchgroups', chatcontroller.fetchgroups)

router.post('/joinstatus', auth, chatcontroller.joinstatus)


router.post('/joinbutton', auth, chatcontroller.joinbutton)
module.exports = router
