const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/authentication");

const { getMessages, createMessage } = require("../controllers/messageController");

router.route("/:chatId").get(authenticateUser, getMessages);
router.route("/").post(authenticateUser, createMessage);

module.exports = router;
