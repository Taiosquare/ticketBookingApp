const { Payment } = require("../../../models/payment");
const { StandardResponse } = require("../../../helpers/standardResponse");
const mongoose = require("mongoose");

const createPaymentDetails = async (requestBody, userId) => {
    try {
        const { bankDetails } = requestBody;

        const paymentDetails = await Payment.findOne({
            user: userId
        });

        if (paymentDetails != null) {
            return StandardResponse.errorMessage("User Payment Details already created");
        }

        const newPaymentDetails = await Payment.create({
            _id: mongoose.Types.ObjectId(),
            user: userId,
            bankDetails: [
                {
                    accountName: bankDetails.accountName,
                    email: bankDetails.email,
                    bank: bankDetails.bank,
                    birthday: bankDetails.birthday,
                    phoneNumber: bankDetails.phoneNumber
                }
            ],
        });

        return StandardResponse.successMessage(
            "Payment Details sucessfully created",
            { bankDetails: newPaymentDetails.bankDetails[0] }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.PaymentManager = {
    createPaymentDetails
}