const { WeeklyPayment } = require("../models/weeklyPayment");

const processHostPayment = async () => {
    const weeklyPayments = await WeeklyPayment.find();

    for (weeklyPayment of weeklyPayments) {
        try {
            let recepientCode = "";

            // Fetch Bank Details from User Microservice
            const payment = await Payment.findOne({ user: weeklyPayment.seller });

            
            const order = await Order.findById(weeklyPayment.order);

            if (!payment.recepientCode) {
                payment.recepientCode = await GeneralFunctions.createRecepientCode(
                    payment.bankDetails.accountName,
                    payment.bankDetails.bank.accountNumber,
                    payment.bankDetails.bank.code
                );

                await payment.save();

                recepientCode = payment.recepientCode;
            } else {
                recepientCode = payment.recepientCode;
            }
            
            // const amount = 1000 * 100; 

            const params = {
                "source": "balance",
                "reason": "Order Product Payment",
                "amount": amount,
                "recipient": recepientCode
            }

            const response = await fetch(`https://api.paystack.co/transfer`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params),
            });

            const response2 = await response.json();

            order.orderProducts.id(weeklyPayment.orderProduct).transferCode = response2.data.transfer_code;

            await order.save();

            if (response2.status == true) {
                await WeeklyPayment.findByIdAndDelete(weeklyPayment._id);
            } else {
                console.log("Paystack Payment Failed");
            }
        } catch (error) {
            console.log(error);

            console.log("Error occurred while processing payment");
        }
    }
}

const updateWeeklyPaymentDoc = () => {
    // amqp.connect(process.env.AMQP_TEST_URL, function (error0, connection) {
    //     if (error0) {
    //         console.log(error0);

    //         throw error0;
    //     }
    
    //     connection.createChannel(function (error1, channel) {
    //         if (error1) {
    //             console.log(error1);

    //             throw error1;
    //         }

    //         const queue1 = 'Order_Created';

    //         channel.assertQueue(queue1, {
    //             durable: false
    //         });

    //         channel.consume(queue1, (msg) => {
    //             const product = JSON.parse(msg.content.toString());

    //             // Code
    //         }, { noAck: true });
    //     });
    // });
}

module.exports.PaymentFunctions = {
    processHostPayment,
    updateWeeklyPaymentDoc
}