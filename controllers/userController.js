const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser, checkPermissions } = require("../utils");

const getAllUsers = async (req, res) => {
    const users = await User.find({
        _id: { $ne: req.user.userId }, // Exclude the current user by ID
    }).select("-password -createdAt -updatedAt -__v -role");

    res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }).select("-password");

    if (!user) {
        throw new CustomError.NotFoundError(`User with id: ${req.params.id} does not exist`);
    }

    //checkPermissions(req.user, user._id);

    res.status(StatusCodes.OK).json(user);
};

const showCurrentUser = async (req, res) => {
    console.log(req.user);
    res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new CustomError.BadRequestError("Please provide all values");
    }

    const user = await User.findOneAndUpdate({ _id: req.user.userId }, { email }, { new: true, runValidators: true });

    console.log(req.user.userId);
    const tokenUser = createTokenUser(user);

    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError("Please provide old and new password");
    }

    const user = await User.findOne({ _id: req.user.userId });

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError("Invalid credentials");
    }

    user.password = newPassword;

    await user.save();
    res.status(StatusCodes.OK).json({ msg: "Password updated successfully" });
};

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
};
