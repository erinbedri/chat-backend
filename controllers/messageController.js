const Message = require("../models/Message");
const { StatusCodes } = require("http-status-codes");

const createMessage = async (req, res) => {
    const senderId = req.user.userId;
    const { chatId, text } = req.body;

    try {
        const message = await Message.create({
            sender: senderId,
            chat: chatId,
            text,
        });

        res.status(StatusCodes.CREATED).json(message);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

const getMessages = async (req, res) => {
    const { chatId } = req.body;

    try {
        const messages = await Message.find({
            chatId,
        });

        res.status(StatusCodes.OK).json(messages);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

module.exports = {
    getMessages,
    createMessage,
};
