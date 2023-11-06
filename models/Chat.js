const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Types.ObjectId,
                red: "User",
                required: true,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
