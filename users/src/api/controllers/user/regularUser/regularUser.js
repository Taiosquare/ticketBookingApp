const { Event } = require("../../../models/event");
const { User } = require("../../../models/user");
const { RegularUserManager } = require("../../../managers/user/regularUser/regularUserManager");
const mongoose = require("mongoose");
const { startSession } = require("mongoose");
const { Validations } = require("../../../helpers/validations");
const { RouteResponse } = require("../../../helpers/routeResponse");
const { StandardResponse } = require("../../../helpers/standardResponse");

exports.searchEvents = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const userVerification = await Validations.userVerification(req, "regularUser");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }
        
        const events = await Event.aggregate([
            {
                $search: {
                    text: {
                        query: req.body.tag,
                        path: req.body.premise,
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 2
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: "host",
                    foreignField: "_id",
                    as: "Host"
                }
            },
            {
                $unwind: {
                    path: '$host'
                }
            },
            {
                $project: {
                    title: 1,
                    host: {
                        name: '$host.businessDetails.name'
                    },
                    type: 1,
                    category: 1,
                    location: {
                        town: 1
                    },
                    rating: {
                        averageScore: 1
                    },
                    dates: 1
                }
            }
        ]);

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { events: events }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error Fetching Events, please try again."), res
        );
    }
}

exports.rateEvent = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const userVerification = await Validations.userVerification(req, "regularUser");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        session.startTransaction();
        const opts = { session, new: true };

        const rateEvent = await RegularUserManager.rateEvent(session, opts, req.body, req.params.eventId, req.user._id)
        
        if (rateEvent.status == false) {
            if (rateEvent.serverError == true) {
                throw rateEvent.error;
            }
            
            return RouteResponse.badRequest(rateEvent, res);
        } 

        RouteResponse.OkMessage(rateEvent, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error Rating Event, please try again."), res
        );
    }
}

exports.getEvent = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const userVerification = await Validations.userVerification(req, "regularUser");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        const event = await Event.aggregate([
            { $match: { '_id': mongoose.Types.ObjectId(req.params.eventId) } },
             {
                $lookup: {
                    from: User.collection.name,
                    localField: "host",
                    foreignField: "_id",
                    as: "Host"
                }
            },
            {
                $unwind: {
                    path: '$Host'
                }
            },
            {
                $project: {
                    title: 1,
                    host: {
                        name: '$Host.businessDetails.name'
                    },
                    poster: 1,
                    type: 1,
                    category: 1,
                    keywords: 1,
                    description: 1,
                    location: 1,
                    tickets: 1,
                    rating: 1,
                    minimumAge: 1,
                    availableSpace: 1,
                    dates: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { event: event }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error Fetching Event Details, please try again."), res
        );
    }
}

exports.getBookedEvents = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const userVerification = await Validations.userVerification(req, "regularUser");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        const user = await User.findById(req.user._id)
            .populate({
                path: 'bookedEvents',
                populate: {
                    path: 'event',
                    select: 'title location.state dates'
                },
            });

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { events: user.bookedEvents }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error Fetching Events, please try again."), res
        );
    }
}



