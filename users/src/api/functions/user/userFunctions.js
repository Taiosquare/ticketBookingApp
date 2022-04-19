const { User } = require("../../models/user");

const getUserById = (userId) => {
    return await User.findById(userId);
}

module.exports.UserFunctions = {
    getUserById
} 