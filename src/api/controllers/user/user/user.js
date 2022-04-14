const { Event } = require("../../../models/event");
const { User } = require("../../../models/user");
const { GeneralFunctions }= require("../../../functions/generalFunctions");
const { UserManager } = require("../../../managers/user/user/userManager");
const { PaymentManager } = require("../../../managers/user/user/paymentManager");
const mongoose = require("mongoose");
const { startSession } = require("mongoose");

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
        
        // Premises: title, type, category, keywords*
        await Event.aggregate([
            {
                $search: {
                    text: {
                        query: requestBody.tag,
                        path: requestBody.premise,
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

        const rateEvent = await UserManager.rateEvent(session, opts, req.body, req.params.eventId, req.user._id)
        
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

exports.eventBankPayment = async (req, res) => {
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

        const eventBankPayment = await PaymentManager.eventBankPayment(req.body, req.params.eventId);

        if (eventBankPayment.status == false) {
            if (eventBankPayment.serverError == true) {
                throw eventBankPayment.error;
            }
            
            return RouteResponse.badRequest(eventBankPayment, res);
        } 

        RouteResponse.OkMessage(eventBankPayment, res);
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while trying to initiate the payment, please try again."), res
        );
    }
}

exports.eventBankPaymentVerification = async (req, res) => {
    // EventFunctions.bankPaymentVerification(req, res, req.params.eventId);
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

        const eventBankPaymentVerification = await PaymentManager.eventBankPaymentVerification(req.body, req.params.eventId);

        if (eventBankPaymentVerification.status == false) {
            if (eventBankPaymentVerification.serverError == true) {
                throw eventBankPaymentVerification.error;
            }
            
            return RouteResponse.badRequest(eventBankPaymentVerification, res);
        } 

        RouteResponse.OkMessage(eventBankPaymentVerification, res);
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while trying to verify payment, please try again."), res
        );
    }
}

// Replicate the workflow for ED
exports.saveEventDetails = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: await GeneralFunctions.validationErrorCheck(errors)
      });
    }

    const { spacesBooked } = req.body;
    const eventId = req.params.eventId;
    const userId = req.user._id;

    await Event.updateOne(
      { _id: eventId },
      {
        $inc: { availableSpace: -Math.abs(spacesBooked) },
        $inc: { "tickets.availableTickets": - Math.abs(spacesBooked) },
        $push: {
          users: {
            user: req.user._id,
            numOfTickets: spacesBooked
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
            spacesReserved: spacesBooked
          }
        }
      }
    );

    res.status(201).json({
      message: "Event successfully booked. Please check your email address for your ticket(s).",
      spacesBooked: spacesBooked,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error Booking Event, please try again.",
    });
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
            { $match: { '_id': mongoose.Types.ObjectId(req.params.id) } },
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



// Cron job for setting the isUsed field to 'true' after an event ends