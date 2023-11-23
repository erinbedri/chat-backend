const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
    const accessTokenJWT = createJWT({ payload: { user } });
    const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

    const tenMin = 1000 * 60 * 10;
    const thirtyDays = 1000 * 60 * 60 * 24 * 30;

    res.cookie("accessToken", accessTokenJWT, {
        httpOnly: true,
        expires: new Date(Date.now() + tenMin),
        secure: process.env.NODE_ENV === "production",
        signed: true,
        sameSite: process.env.NODE_ENV === "production" && "None",
    });

    res.cookie("refreshToken", refreshTokenJWT, {
        httpOnly: true,
        expires: new Date(Date.now() + thirtyDays),
        secure: process.env.NODE_ENV === "production",
        signed: true,
        sameSite: process.env.NODE_ENV === "production" && "None",
    });
};

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
};
