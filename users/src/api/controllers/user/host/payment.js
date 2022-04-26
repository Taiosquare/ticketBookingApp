const { Event } = require("../../../models/event");
const { AuthFunctions } = require("../../../functions/auth/authFunctions");
const { HostManager } = require("../../../managers/user/host/hostManager");
const { startSession } = require("mongoose");
const { Payment } = require("../../../models/payment");

// exports.getPaymentDetails = (req, res) => {
// }

// exports.createPaymentDetails = (req, res) => {
// }

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