const { User } = require("../../models/user");

const getUserById = async (userId) => {
    return await User.findById(userId);
}

module.exports.UserFunctions = {
    getUserById
} 