const { EventFunctions } = require("../../../functions/event/eventFunctions");
const { PaymentFunctions } = require("../../../functions/payment/paymentFunctions");
const { PaymentManager } = require("../../../managers/user/regularUser/paymentManager");
const { Validations } = require("../../../helpers/validations");
const { RouteResponse } = require("../../../helpers/routeResponse");
const { StandardResponse } = require("../../../helpers/standardResponse");
const { Payment } = require("../../../models/payment");

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

        // eventBankPaymentVerification.data = null;
        RouteResponse.OkMessage(eventBankPaymentVerification, res);
    
        // Add to a Queue
        await EventFunctions.saveBookingDetails(req.body, req.params.eventId, req.user._id);
        
        // Add to a Queue
        await PaymentFunctions.sendWeeklyPaymentMessage(req.body, req.params.eventId, req.user._id);

        // Add to a Queue
        // await EventFunctions.sendTicketsToUsers(eventBankPaymentVerification.data); 
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while trying to verify payment, please try again."), res
        );
    }
}

exports.getPaymentDetails = async (req, res) => {
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

        const userVerification = await Validations.userVerification(req, "regularUser");

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

exports.addPaymentDetails = async (req, res) => {
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

        const addPaymentDetails = await PaymentManager.addPaymentDetails(req.body, req.user._id);

        if (addPaymentDetails.status == false) { 
            return RouteResponse.badRequest(addPaymentDetails, res);
        } 

        RouteResponse.OkMessage200(addPaymentDetails, res);
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while adding Payment Details, please try again."), res
        );
    } 
}

exports.deletePaymentDetails = async (req, res) => {
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

        const { accountName, birthday } = req.body;

        await Payment.updateOne(
            {
                user: req.user._id,
            },
            {
                $pull: {
                    bankDetails: {
                        accountName: accountName,
                        birthday: birthday
                    }
                }
            }
        );

        RouteResponse.OkMessage(
            StandardResponse.successMessage(
                "Payment Details sucessfully deleted",
            ),
            res
        );
    } catch (error) {
        console.log(error);

        RouteResponse.internalServerError(
            StandardResponse.serverError(
                "An error occurred while deleting Payment Details, please try again."
            ),
            res
        );
    }
}