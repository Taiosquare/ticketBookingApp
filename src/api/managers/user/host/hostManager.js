const { User } = require("../../../models/user");
const { Event } = require("../../../models/event");
const { StandardResponse } = require("../../../helpers/standardResponse");
const { EventFunctions } = require("../../../functions/event/eventFunctions"); 
const mongoose = require("mongoose");

const addEvent = async (session, opts, requestBody, hostId) => {
    try {
        const { title, poster, type, category, description,
            location, tickets, minimumAge, dates, availableSpace
        } = requestBody;

        const event = await Event.findOne({ title: title, host: hostId });

        if (event) {
            return StandardResponse.errorMessage("Event already added");
        }

        const savedObject = await Event.create([
            {
                _id: mongoose.Types.ObjectId(),
                title: title,
                poster: poster,
                type: type,
                category: category,
                keywords: keywords,
                description: description,
                location: location,
                tickets: tickets,
                minimumAge: minimumAge,
                dates: dates,
                availableSpace: availableSpace,
                host: hostId
            }
        ], opts);

        await User.updateOne(
            {
                _id: hostId
            },
            [
                {
                    $push: {
                        events: savedObject._id
                    }
                }
            ],
            opts
        );

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Event successfully added",
            {
                event: {
                    _id: newEvent._id,
                    title: newEvent.title,
                    category: newEvent.category,
                    location: newEvent.location,
                    dates: newEvent.dates
                }
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const editEvent = async (session, opts, requestBody, eventId) => {
    try {
        const event = await Event.findById(eventId);

        if (EventFunctions.checkIfDateHasPassed(event.dates.end)) {
            return StandardResponse.errorMessage("Events that have ended cannot be modified");
        }  

        requestBody.title && (event.title = requestBody.title);
        requestBody.poster && (event.poster = requestBody.poster);
        requestBody.type && (event.type = requestBody.type);
        requestBody.category && (event.category = requestBody.category);
        requestBody.description && (event.description = requestBody.description);
        requestBody.location && (event.location = requestBody.location);
        requestBody.tickets && (event.tickets = requestBody.tickets);
        (requestBody.minimumAge || (requestBody.minimumAge == null)) && (event.minimumAge = requestBody.minimumAge);
        requestBody.dates && (event.dates = requestBody.dates);
        requestBody.availableSpace && (event.availableSpace = requestBody.availableSpace);

        const updatedObject = await event.save(opts);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Event Details Updated Successfully",
            {
                event: {
                    _id: updatedObject._id,
                    title: updatedObject.title,
                    category: updatedObject.category,
                    location: updatedObject.location,
                    dates: updatedObject.dates
                }
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const deleteEvent = (session, opts, eventId, hostId ) => {
    try { 
        if (EventFunctions.checkIfDateHasPassed(event.dates.start)) {
            return StandardResponse.errorMessage("Events that have ended cannot be modified");
        }

        await User.updateOne(
            {
                _id: hostId
            },
            [
                {
                    $pull: {
                        events: eventId
                    }
                }
            ],
            opts
        );

        await Event.findByIdAndDelete(eventId);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Event Deleted Successfully",
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.HostManager = {
    addEvent,
    editEvent,
    deleteEvent
};