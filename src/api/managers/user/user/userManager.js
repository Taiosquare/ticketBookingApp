const { User } = require("../../../models/user");
const { StandardResponse } = require("../../../helpers/standardResponse");
const { EventFunctions } = require("../../../functions/event/eventFunctions"); 
const mongoose = require("mongoose");

const rateEvent = (session, opts, requestBody, eventId, userId) => {
    try {
        let event = await EventFunctions.getEventById(eventId);

        if (event.rating.ratings.user.includes(userId)) {
            return StandardResponse.errorMessage("This user has rated this event before");
        }

        const { rating } = requestBody;

        event.rating.numOfRatings++;

        event.rating.ratings.push(rating);

        const totalRatingsSum = event.rating.ratings.reduce(function (a, b) {
            return a + b;
        }, 0);

        event.rating.averageScore = (totalRatingsSum) / event.rating.numOfRatings;

        await event.save(opts);

        await User.updateOne(
            { _id: userId },
            {
                $push: {
                    ratedEvents: {
                        event: eventId,
                        rating: rating
                    }
                }
            },
        );
        
        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Event successfully rated",
            {
                rating: rating,
                event: {
                    title: event.title,
                    averageRating: Math.round((event.rating.averageScore + Number.EPSILON) * 100) / 100,
                    totalRatings: event.rating.numOfRatings
                }
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const saveEventDetails = () => {

}

module.exports.UserManager = {
    rateEvent,
    saveEventDetails
};

