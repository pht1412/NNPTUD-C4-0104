
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messages');
const { uploadFile } = require('../utils/uploadHandler'); // Assuming you have a generic file upload handler
const { CheckLogin } = require('../utils/authHandler');

router.post('/', CheckLogin, uploadFile.single('file'), messageController.sendMessage);
router.get('/:userID', CheckLogin, messageController.getMessagesWithUser);
router.get('/', CheckLogin, messageController.getLastMessages);

module.exports = router;
