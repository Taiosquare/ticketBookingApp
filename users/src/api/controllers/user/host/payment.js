const amqp = require('amqplib/callback_api');
const config = require('../../../../../config');
const { startSession } = require("mongoose");
const { Payment } = require("../../../models/payment");
const { PaymentFunctions } = require("../../../functions/payment/paymentFunctions");
const { UserFunctions } = require("../../../functions/user/userFunctions");
const { Validations } = require("../../../helpers/validations");
const { PaymentManager } = require("../../../managers/user/host/paymentManager"); 
const { StandardResponse } = require("../../../helpers/standardResponse");
const { RouteResponse } = require("../../../helpers/routeResponse");


exports.viewPaymentDetails = async (req, res) => {
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

        const paymentDetails = await PaymentFunctions.getPaymentDetails(req.user._id)

        RouteResponse.OkMessage(
            StandardResponse.successMessage(
                "success",
                { paymentDetails: paymentDetails.bankDetails }
            ),
            res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while retrieving payment details, please try again."), res
        );
    }
}

exports.createPaymentDetails = async (req, res) => {
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

        const createPaymentDetails = await PaymentManager.createPaymentDetails(req.body, req.user._id);

        if (createPaymentDetails.status == false) {
            if (createPaymentDetails.serverError == true) {
                throw createPaymentDetails.error;
            }
            
            return RouteResponse.badRequest(createPaymentDetails, res);
        } 

        RouteResponse.OkMessage201(createPaymentDetails, res);
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while creating Payment Details, please try again."), res
        );
    }  
}

exports.updatePaymentDetails = async (req, res) => {
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

        await Payment.updateOne(
            {
                user: req.user._id
            },
            {
                bankDetails: bankDetails
            }
        )

        RouteResponse.OkMessage(
            StandardResponse.successMessage(
                "Payment Details sucessfully updated",
            ),
            res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while updating Payment Details, please try again."), res
        );
    }
}

exports.createPaymentDetails = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const createPaymentDetails = await PaymentManager.createPaymentDetails(req.body, req.user._id);

        if (createPaymentDetails.status == false) {
            if (createPaymentDetails.serverError == true) {
                throw createPaymentDetails.error;
            }
            
            return RouteResponse.badRequest(createPaymentDetails, res);
        } 

        RouteResponse.OkMessage201(createPaymentDetails, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Event Details Failed to Update, please try again."), res
        );
    }
}

amqp.connect(config.AMQP_URL, function (error0, connection) {    
    if (error0) {
        console.log(error0);

        throw error0;
    }

    connection.createChannel(function (error1, channel) {
        if (error1) {
            console.log(error1);

            throw error1;
        }

        const queue1 = 'Get_Payment_Details';

        channel.assertQueue(queue1, {
            durable: false
        });

        let hostPaymentDetails = {};

        channel.consume(queue1, (msg) => {
            const hostId = JSON.parse(msg.content.toString());

            if (typeof (hostId) != 'object') {
                hostPaymentDetails = PaymentFunctions.getPaymentDetails(hostId);

                console.log(hostPaymentDetails);
            }
        }, { noAck: true });

        channel.sendToQueue(queue1, Buffer.from(JSON.stringify(hostPaymentDetails)));
    });
});

amqp.connect(config.AMQP_URL, function (error0, connection) {
    if (error0) {
        console.log(error0);

        throw error0;
    }

    connection.createChannel(function (error1, channel) {
        if (error1) {
            console.log(error1);

            throw error1;
        }

        const queue1 = 'Get_Tickets';

        channel.assertQueue(queue1, {
            durable: false
        });

        let tickets = {};

        channel.consume(queue1, (msg) => {
            const ticket = JSON.parse(msg.content.toString());
            
            tickets = UserFunctions.getTickets(ticket.reference);
        }, { noAck: true });

        channel.sendToQueue(queue1, Buffer.from(JSON.stringify(tickets)));
    });
});

