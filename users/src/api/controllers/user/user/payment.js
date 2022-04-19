const { EventFunctions }= require("../../../functions/event/eventFunctions");
const { PaymentManager } = require("../../../managers/user/user/paymentManager");
const { Validations } = require("../../../helpers/validations");
const { RouteResponse } = require("../../../helpers/routeResponse");
const { StandardResponse } = require("../../../helpers/standardResponse");

exports.initiateEventPayment = async (req, res) => {
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

        const eventBankPayment = await PaymentManager.initiateEventPayment(req.body, req.params.eventId);

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

exports.verifyEventPayment = async (req, res) => {
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

        const eventBankPaymentVerification = await PaymentManager.verifyEventPayment(req.body, req.params.eventId, req.user._id);

        if (eventBankPaymentVerification.status == false) {
            if (eventBankPaymentVerification.serverError == true) {
                throw eventBankPaymentVerification.error;
            }
            
            return RouteResponse.badRequest(eventBankPaymentVerification, res);
        } 

        RouteResponse.OkMessage(eventBankPaymentVerification, res);
    
        await EventFunctions.saveBookingDetails(req.body, req.params.eventId, req.user._id);
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while trying to verify payment, please try again."), res
        );
    }
}