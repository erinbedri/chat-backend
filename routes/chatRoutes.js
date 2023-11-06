const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/authentication");

const { createChat, getUserChats, getSingleChat } = require("../controllers/chatController");

router.route("/").post(authenticateUser, createChat);
router.route("/").get(authenticateUser, getUserChats);
router.route("/:memberId").get(authenticateUser, getSingleChat);

module.exports = router;
