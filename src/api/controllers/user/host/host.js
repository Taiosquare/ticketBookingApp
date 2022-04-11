const { Event } = require("../../../models/event");
const { AuthFunctions } = require("../../../functions/auth/authFunctions");
const { HostManager } = require("../../../managers/user/host/hostManager");
const { startSession } = require("mongoose");

exports.addEvent = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const userVerification = await Validations.userVerification(req, "host");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        session.startTransaction();
        const opts = { session, new: true };

        const addEvent = await HostManager.addEvent(session, opts, req.body, req.user._id);

        if (addEvent.status == false) {
            if (addEvent.serverError == true) {
                throw addEvent.error;
            }
            
            return RouteResponse.badRequest(addEvent, res);
        } 
        
        RouteResponse.OkMessage201(addEvent, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Event could not be registered, please try again."), res
        );
    }
}

exports.editEvent = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();
    
    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if (!AuthFunctions.verifyHost(req.params.eventId, req.user._id)) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid Host"), res
            );
        }
        
        session.startTransaction();
        const opts = { session, new: true };

        const editEvent = await HostManager.editEvent(session, opts, req.body, req.params.eventId);

        if (editEvent.status == false) {
            if (editEvent.serverError == true) {
                throw editEvent.error;
            }
            
            return RouteResponse.badRequest(editEvent, res);
        } 
            
        RouteResponse.OkMessage(editEvent, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Event Details Failed to Update, please try again."), res
        );
    }
}

exports.deleteEvent = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if (!AuthFunctions.verifyHost(req.params.eventId, req.user._id)) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid Host"), res
            );
        }

        session.startTransaction();
        const opts = { session, new: true };

        const deleteEvent = await HostManager.editEvent(session, opts, req.body, req.params.eventId);

        if (deleteEvent.status == false) {
            if (deleteEvent.serverError == true) {
                throw deleteEvent.error;
            }
            
            return RouteResponse.badRequest(deleteEvent, res);
        } 
            
        RouteResponse.OkMessage(deleteEvent, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Event Failed to Delete"), res
        );
    }
}

// // Retry Transfer in case the OTP expires

// exports.verifyTicketPayment = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       res.status(400).json({
//         errors: await GeneralFunctions.validationErrorCheck(errors)
//       });
//     } else {
//       const { otp } = req.body;

//       const event = await Event.findById(req.params.eventId);

//       const params = {
//         "transfer_code": event.transferCode,
//         "otp": otp,
//       }

//       const response = await fetch(`https://api.paystack.co/transfer/finalize_transfer`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(params),
//       });

//       const response2 = await response.json();

//       if (response2.status == true) {
//         event.transferCode = undefined;

//         await event.save();

//         res.status(200).json({
//           message: 'Payment has successfully been verified.',
//         });
//       } else {
//         res.status(400).json({
//           error: 'Error: The Payment could not be verified, please try again.',
//         });
//       }
//     }
//   } catch (error) {
//     res.status(400).json({
//       error: 'Error: The Payment could not be verified, please try again.',
//     });
//   }
// }

exports.viewBookedUsers = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if (!AuthFunctions.verifyHost(req.params.eventId, req.user._id)) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid Host"), res
            );
        }

        const event = await Event.findById(req.params.eventId)
            .populate({
                path: 'users',
                populate: {
                path: 'user',
                    select: 'username firstname lastname email'
                },
            });

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { bookedUsers: event.users }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error Fetching Event's Booked Users, please try again."), res
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

        const userVerification = await Validations.userVerification(req, "host");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        const event = await Event.aggregate([
            { $match: { "_id": mongoose.Types.ObjectId(req.params.eventId) } },
            {
                $project: {
                    title: 1,
                    poster: 1,
                    location: {
                        address: 1,
                    },
                    rating: {
                        averageScore: 1,
                        numOfRatings: 1
                    },
                    keywords: 1,
                    category: 1,
                    type: 1,
                    description: 1,
                    tickets: 1,
                    minimumAge: 1,
                    dates: 1,
                    availableSpace: 1,
                    users: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { event: event[0] }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error Fetching Event Details, please try again."), res
        );
    }
}

exports.getEvents = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const userVerification = await Validations.userVerification(req, "host");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        const events = await Event.aggregate([
            { $match: { "host": mongoose.Types.ObjectId(req.user._id) } },
            {
                $project: {
                    title: 1,
                    category: 1,
                    type: 1,
                    image: 1,
                    rating: "$rating.averageScore",
                    state: "$location.state",
                    from: "$dates.start",
                    to: "$dates.end"
                }
            }
        ]);

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { events: events }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error Fetching User's Events, please try again."), res
        );
    }
}

