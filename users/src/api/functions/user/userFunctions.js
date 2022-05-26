const { User } = require("../../models/user");
const { Ticket } = require("../../models/ticket");

const getUserById = async (userId) => {
    return await User.findById(userId);
}

const getTickets = async (reference) => {
    return await Ticket.find({ paymentReference: reference });
}

module.exports.UserFunctions = {
    getUserById, getTickets
} 