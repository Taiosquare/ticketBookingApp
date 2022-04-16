const { User } = require("../../models/user");
const { Event } = require("../../models/event");
const { Ticket } = require("../../models/ticket");
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

const getEventById = async (eventId) => {
    return await Event.findById(eventId);
}

const saveBookingDetails = async (requestBody, eventId, userId) => {
    const { spacesBooked } = requestBody;

    await Event.updateOne(
        { _id: eventId },
        {
            $inc: { availableSpace: -Math.abs(spacesBooked) },
            $inc: { "tickets.availableTickets": - Math.abs(spacesBooked) },
            $push: {
                attendees: {
                    user: req.user._id,
                    spacesBooked: spacesBooked
                }
            }
        }
    );

    await User.updateOne(
        { _id: userId },
        {
            $push: {
                bookedEvents: {
                    event: eventId,
                    spacesBooked: spacesBooked
                }
            }
        }
    );
}

module.exports.EventFunctions = {
    generateTickets,
    checkIfDateHasPassed,
    getEventById,
    saveBookingDetails
} 