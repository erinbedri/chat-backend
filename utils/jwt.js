const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
	const token = jwt.sign(payload, process.env.JWT_SECRET);

	return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
	const accessTokenJWT = createJWT({ payload: { user } });
	const refreshTokenJWT = createJWT({ payload: user, refreshToken });

	const fifteenMin = 1000 * 60 * 15;
	const thirtyDays = 1000 * 60 * 60 * 24 * 30;

	res.cookie("accessToken", accessTokenJWT, {
		httpOnly: true,
		expires: new Date(Date.now() + fifteenMin),
		secure: process.env.NODE_ENV === "production",
		signed: true,
	});

	res.cookie("refreshToken", refreshTokenJWT, {
		httpOnly: true,
		expires: new Date(Date.now() + thirtyDays),
		secure: process.env.NODE_ENV === "production",
		signed: true,
	});
};

module.exports = {
	createJWT,
	isTokenValid,
	attachCookiesToResponse,
};
