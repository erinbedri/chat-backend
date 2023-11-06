const { request } = require("express");

const { attachCookiesToResponse } = require("../utils");
const CustomError = require("../errors");
const { isTokenValid } = require("../utils");
const Token = require("../models/Token");

const authenticateUser = async (req, res, next) => {
    const { refreshToken, accessToken } = req.signedCookies;

    try {
        if (accessToken) {
            const payload = isTokenValid(accessToken);
            //console.log(payload);
            request.user = payload.user;

            return next();
        }

        const payload = isTokenValid(refreshToken);

        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });

        if (!existingToken || !existingToken?.isValid) {
            throw new CustomError.UnauthenticatedError("Authentication invalid");
        }

        attachCookiesToResponse({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken,
        });
        request.user = payload.user;

        next();
    } catch (error) {
        console.log(error);
        throw new CustomError.UnauthenticatedError("Authentication invalid!");
    }
};

module.exports = {
    authenticateUser,
};
