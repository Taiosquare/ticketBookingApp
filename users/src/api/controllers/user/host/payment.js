const { Event } = require("../../../models/event");
const { AuthFunctions } = require("../../../functions/auth/authFunctions");
const { HostManager } = require("../../../managers/user/host/hostManager");
const { startSession } = require("mongoose");
const { Payment } = require("../../../models/payment");

exports.getPaymentDetails = async (req, res) => {
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

exports.updatePaymentDetails = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        let account = await Account.findOne({ host: req.user._id });

        req.body.accountName && (account.accountName = req.body.accountName);
        req.body.accountNumber && (account.accountNumber = req.body.accountNumber);
        req.body.bank && (account.bank = req.body.bank);

        const result = await account.save();

        res.status(200).json({
            message: "Account Details Updated Successfully",
            account: {
                _id: result._id,
                accountName: result.accountName,
                accountNumber: result.accountNumber,
                bank: result.bank,
            },
        });
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Event Details Failed to Update, please try again."), res
        );
    }
}

