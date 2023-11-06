const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Types.ObjectId,
            red: "Chat",
            required: true,
        },
        sender: {
            type: mongoose.Types.ObjectId,
            red: "User",
            required: true,
        },
        text: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
