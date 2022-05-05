const { Payment } = require("../../../models/payment");
const { StandardResponse } = require("../../../helpers/standardResponse");

const updatePaymentDetails = async (requestBody, userId) => {
    try {
        let payment = await Payment.findOne({ host: userId });

        requestBody.accountName && (payment.bankDetails[0].accountName = requestBody.accountName);
        requestBody.accountNumber && (payment.bankDetails[0].accountNumber = requestBody.accountNumber);
        requestBody.bank && (payment.bankDetails[0].bank = requestBody.bank);
        requestBody.birthday && (payment.bankDetails[0].birthday = requestBody.birthday);
        requestBody.phoneNumber && (payment.bankDetails[0].phoneNumber = requestBody.phoneNumber);

        const result = await payment.save();

        return StandardResponse.successMessage(
            'Payment Details Updated Successfully',
            {
                _id: result._id,
                accountName: result.accountName,
                accountNumber: result.accountNumber,
                bank: result.bank,
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.PaymentManager = {
    updatePaymentDetails
}