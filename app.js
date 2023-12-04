require("dotenv").config();
require("express-async-errors");
const socketIO = require("socket.io");

// express
const express = require("express");
const app = express();

// other packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanizize = require("express-mongo-sanitize");
const cors = require("cors");

// database
const connectDB = require("./db/connect");

// routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 1000,
    })
);
app.use(helmet());
app.use(xss());
app.use(mongoSanizize());
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.send("CHAT API");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const startDB = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        console.log("DB Connected...");
    } catch (err) {
        console.error(err);
    }
};
startDB();

const expressServer = app.listen(port, console.log(`Server is listening at ${port}...`));

// socket io
const io = socketIO(expressServer, {
    cors: {
        origin: process.env.URL,
    },
});

let onlineUsers = [];

io.on("connection", (socket) => {
    console.log("new connection", socket.id);

    socket.on("addNewUser", (userId) => {
        console.log(userId);
        !onlineUsers.some((user) => user.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });

        io.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("sendMessage", (message) => {
        console.log(message);
        const user = onlineUsers.find((user) => user.userId == message.recipientId);

        if (user) {
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                senderId: message.sender,
                isRead: false,
                date: new Date(),
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);

        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("getOnlineUsers", onlineUsers);
    });
});
