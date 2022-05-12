const amqp = require('amqplib/callback_api');
const config = require('../../../config');
const cron = require('node-cron');
const { PaymentFunctions } = require('../functions/paymentFunctions');


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

        const queue1 = 'Send_Weekly_Payment';

        channel.assertQueue(queue1, {
            durable: false
        });

        channel.consume(queue1, (msg) => {
            const weeklyPaymentObject = JSON.parse(msg.content.toString());
            
            PaymentFunctions.updateWeeklyPaymentDoc(weeklyPaymentObject);
        }, { noAck: true });
    });
});


exports.webhookSuccess = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        let hash = crypto.createHmac('sha512', process.env.PAYSTACK_TEST_SECRET)
        .update(JSON.stringify(req.body)).digest('hex');

        if (hash == req.headers['x-paystack-signature']) {
            let webhookData = JSON.parse(req.body);

            if (webhookData.event == 'charge.success') {
                await PaymentFunctions.saveChargeWebhook(webhookData);
            } else if (webhookData.event == 'transfer.success') {
                await PaymentFunctions.saveTransferWebhook(webhookData);
            }

            res.sendStatus(200);
        }
    } catch (error) {
        res.sendStatus(400);
    }
}


// cron.schedule('00 12 * * 5', async function () {
//     await PaymentFunctions.processHostPayment();
// });

// cron.schedule('00 11 * * 2', async function () {
//     await PaymentFunctions.processHostPayment();
// });



exports.test = async (req, res) => {
    await PaymentFunctions.processHostPayment();

    res.sendStatus(200);
}



// Cron job for setting the isUsed field on tickets to 'true' after an event ends