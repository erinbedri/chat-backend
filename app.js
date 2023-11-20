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
        max: 100,
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
        origin: "http://localhost:3000",
    },
});

let onlineUsers = [];

io.on("connection", (socket) => {
    console.log("user connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
    });

    socket.on("addNewUser", (userId) => {
        !onlineUsers.some((user) => user.userId == userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });
    });

    console.log("ONLINE:", onlineUsers);
});
