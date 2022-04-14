const { Event } = require("../../models/event");
const { Ticket } = require("../../models/ticket");
const { UserFunctions } = require("../../functions/user/userFunctions");
const crypto = require("crypto");
const mongoose = require("mongoose");

const generateTickets = async (event, numOfTickets, reference, userId) => {
    let tickets = [];

    for (let i = 0; i < numOfTickets; i++) {
        const ticket = {
            ticketID: await crypto.randomBytes(8),
            event: {
                _id: event._id,
                title: event.title,
                type: event.type,
                category: event.category,
                dates: event.dates
            },
            price: event.tickets.price,
            paymentReference: reference
        }

        await Ticket.create({
            _id: mongoose.Types.ObjectId(),
            user: userId,
            ticket,
            paymentStatus: "Paid",
        })
       
        tickets.push(ticket);
    }

    // Convert the tickets array into a Document and add it as an attachment
    // or upload the doc to S3 & include the link in the email

    // const user = await UserFunctions.getUserById(req.user._id);
}

const checkIfDateHasPassed = (eventDate) => {
    if (eventDate < new Date()) {
        return true;
    }  

    return false;
}

const getEventById = (eventId) => {
    return await Event.findById(eventId);
}

module.exports.EventFunctions = {
    generateTickets,
    checkIfDateHasPassed,
    getEventById
} 