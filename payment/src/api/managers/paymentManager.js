const { PaymentFunctions } = require("../functions/paymentFunctions") 

const paymentSuccess = async (requestBody, paystackSecret) => {
    try {
        const hash = crypto
            .createHmac('sha512', paystackSecret)
            .update(JSON.stringify(requestBody))
            .digest('hex');

        if (hash == requestBody.headers['x-paystack-signature']) {
            const event = JSON.parse(requestBody);

            if (event.event == 'charge.success') {
                await PaymentFunctions.savePaymentWebhook(event);
            } else if (event.event == 'transfer.success') {
                await PaymentFunctions.saveTransferWebhook(event);
            }

            res.send(200);
        }
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.PaymentManager = {
    paymentSuccess
};