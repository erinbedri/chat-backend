const createTokenUser = (user) => {
	return { userId: user._id, email: user.email, role: user.role };
};

module.exports = createTokenUser;
