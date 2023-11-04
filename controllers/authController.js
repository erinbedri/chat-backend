const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");

const { attachCookiesToResponse, createTokenUser } = require("../utils");

const CustomError = require("../errors");

const register = async (req, res) => {
	const { email, password } = req.body;
	const emailAlreadyExists = await User.findOne({ email });

	if (emailAlreadyExists) {
		throw new CustomError.BadRequestError("Email already exists");
	}

	const user = await User.create({ email, password });
	const tokenUser = createTokenUser(user);

	attachCookiesToResponse({ res, user: tokenUser });

	res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		throw new CustomError.BadRequestError(
			"Please provide email and password"
		);
	}

	const user = await User.findOne({ email });

	if (!user) {
		throw new CustomError.UnauthenticatedError("Invalid credentials");
	}

	const isPasswordCorrect = await user.comparePassword(password);

	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError("Invalid credentials");
	}

	const tokenUser = createTokenUser(user);

	let refreshToken = "";
	const existingToken = await Token.findOne({ user: user._id });

	if (existingToken) {
		const { isValid } = existingToken;
		if (!isValid) {
			throw new CustomError.UnauthenticatedError("Invalid credentials");
		}

		refreshToken = existingToken.refreshToken;
		attachCookiesToResponse({ res, user: tokenUser, refreshToken });

		res.status(StatusCodes.OK).json({ user: tokenUser });
		return;
	}

	refreshToken = crypto.randomBytes(40).toString("hex");
	const userAgent = req.headers["user-agent"];
	const ip = req.ip;
	const userToken = { refreshToken, ip, userAgent, user: user._id };

	await Token.create(userToken);

	attachCookiesToResponse({ res, user: tokenUser, refreshToken });

	res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
	await Token.findOneAndDelete({ user: req.user.userId });

	res.cookie("accessToken", "", {
		httpOnly: true,
		expires: new Date(Date.now()),
	});

	res.cookie("refreshToken", "", {
		httpOnly: true,
		expires: new Date(Date.now()),
	});

	res.status(StatusCodes.OK).json({ msg: "User logged out" });
};

module.exports = {
	register,
	login,
	logout,
};
