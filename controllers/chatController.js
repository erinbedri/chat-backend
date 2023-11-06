const Chat = require("../models/Chat");
const { StatusCodes } = require("http-status-codes");

const createChat = async (req, res) => {
    const creatorId = req.user.userId;
    const { memberId } = req.body;

    console.log(creatorId);
    console.log(memberId);

    try {
        const chat = await Chat.findOne({
            members: { $all: [creatorId, memberId] },
        });

        if (chat) {
            return res.status(StatusCodes.OK).json(chat);
        }

        const newChat = await Chat.create({ members: [creatorId, memberId] });
        res.status(StatusCodes.OK).json(newChat);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

const getUserChats = async (req, res) => {
    const userId = req.user.userId;

    try {
        const chats = await Chat.find({ members: { $in: [userId] } });
        return res.status(StatusCodes.OK).json(chats);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

const getSingleChat = async (req, res) => {
    const userId = req.user.userId;
    const { memberId } = req.params;

    try {
        const chat = await Chat.findOne({ members: { $all: [userId, memberId] } });
        return res.status(StatusCodes.OK).json(chat);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

module.exports = {
    createChat,
    getUserChats,
    getSingleChat,
};
