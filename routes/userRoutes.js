const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/authentication");
const { authorizePermissions } = require("../middleware/authorization");

const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
} = require("../controllers/userController");

router.route("/").get(authenticateUser, getAllUsers);
//router.route("/").get(authenticateUser, authorizePermissions("admin"), getAllUsers);

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/:id").get(authenticateUser, getSingleUser);

//router.route("/updateUser").patch(authenticateUser, updateUser);
//router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);

module.exports = router;
