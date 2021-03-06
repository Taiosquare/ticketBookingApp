const { WeeklyPayment } = require("../models/weeklyPayment");
const { Webhook } = require("../models/webhook");
const fetch = require('node-fetch');
const amqp = require('amqplib/callback_api');
const config = require('../../../config');
const mongoose = require("mongoose");

const getPaymentDetails = async (hostId) => {
    amqp.connect(config.AMQP_URL, async (error0, connection) => {
        if (error0) {
            console.log(error0);
            
            throw error0;
        }

        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.log(error1);

                throw error1;
            }

            channel.assertQueue('', { exclusive: true }, async function (error2, q) {
                if (error2) {
                    throw error2;
                }

                await channel.consume(q.queue, async (msg) => {
                    let paymentDetails = {};

                    paymentDetails = JSON.parse(msg.content.toString());

                    return paymentDetails;
                }, {
                    noAck: true
                });

                channel.sendToQueue('rpc_queue',
                    Buffer.from(JSON.stringify(hostId)), {
                        replyTo: q.queue
                    }        
                );
            });
        });
    });
}

const getTickets = async (reference) => {
    let tickets = [];

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
          
            channel.sendToQueue(queue1, Buffer.from(JSON.stringify(reference)));
        
            channel.consume(queue1, (msg) => {
                tickets = JSON.parse(msg.content.toString());
            }, { noAck: true });
        });
    });

    return tickets;
}

const createRecipientCode = async (name, accountNumber, bankCode) => {
    const params = {
        type: "nuban",
        name: name,
        description: `${name}'s recipient code creation`,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN"
    }

    const response = await fetch(`https://api.paystack.co/transferrecipient`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.PAYSTACK_TEST_SECRET}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params),
    });

    const response2 = await response.json();

    return response2.data.recipient_code;
}

const sendUpdatedPaymentDetails = async (paymentDetails) => {
    amqp.connect(config.AMQP_URL, async (error0, connection) => {
        if (error0) {
            console.log(error0);
            
            throw error0;
        }

        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.log(error1);

                throw error1;
            }

            const queue = 'Update_Payment_Details';

            channel.assertQueue(queue, {
                durable: false
            });

            channel.sendToQueue(queue, Buffer.from(JSON.stringify(paymentDetails)));
        });
    });
}

const makeHostPayment = async (paymentDetails, weeklyPayment) => {
    try {
        let recipientCode = "";

        if (!paymentDetails.recipientCode) {
            paymentDetails.recipientCode = await createRecipientCode(
                paymentDetails.bankDetails[0].accountName,
                paymentDetails.bankDetails[0].bank.accountNumber,
                paymentDetails.bankDetails[0].bank.code
            );

            sendUpdatedPaymentDetails(paymentDetails);

            recipientCode = paymentDetails.recipientCode;
        } else {
            recipientCode = paymentDetails.recipientCode;
        }

        let totalAmount = 0;

        for (payment of weeklyPayment.payments) {
            totalAmount += (payment.price * payment.spacesBooked);
        }

        const params = {
            "source": "balance",
            "reason": "Order Product Payment",
            "amount": totalAmount * 100,
            "recipient": recipientCode
        }

        const response = await fetch(`https://api.paystack.co/transfer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.PAYSTACK_TEST_SECRET}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params),
        });

        const response2 = await response.json();

        if (response2.status == true) {
            await WeeklyPayment.updateOne(
                {
                    _id: weeklyPayment._id
                },
                {
                    transferCode: response2.data.transfer_code
                }
            );
        } else {
            console.log("Paystack Payment Failed");
        }
    } catch (error) {
        console.log(error);
    }
}

const processHostPayment = async () => {
    const weeklyPayments = await WeeklyPayment.find();

    for (weeklyPayment of weeklyPayments) {
        try {
            amqp.connect(config.AMQP_URL, async (error0, connection) => {
                if (error0) {
                    console.log(error0);
                    
                    throw error0;
                }

                connection.createChannel(function (error1, channel) {
                    if (error1) {
                        console.log(error1);

                        throw error1;
                    }

                    channel.assertQueue('', { exclusive: true }, async function (error2, q) {
                        if (error2) {
                            throw error2;
                        }

                        await channel.consume(q.queue, async (msg) => {
                            let paymentDetails = {};

                            paymentDetails = JSON.parse(msg.content.toString());

                            await makeHostPayment(paymentDetails, weeklyPayment);
                        }, {
                            noAck: true
                        });

                        channel.sendToQueue('rpc_queue',
                            Buffer.from(JSON.stringify(weeklyPayment.host)), {
                                replyTo: q.queue
                            }        
                        );
                    });
                });
            });
        } catch (error) {
            console.log(error);
        }
    }
}

const updateWeeklyPaymentDoc = async (weeklyPaymentObject) => {
    const hostWeeklyPayment = await WeeklyPayment.findOne(
        {
            host: weeklyPaymentObject.host,
            'event.eventId': weeklyPaymentObject.event.eventId
        }
    );

    if (hostWeeklyPayment == null) {
        const hostId = mongoose.Types.ObjectId(weeklyPaymentObject.host);
        const eventId = mongoose.Types.ObjectId(weeklyPaymentObject.event.eventId);

        await WeeklyPayment.create({
            _id: mongoose.Types.ObjectId(),
            host: hostId,
            event: {
                eventId: eventId,
                eventTitle: weeklyPaymentObject.event.eventTitle,
                ticketsAvailable: {
                    start: weeklyPaymentObject.event.ticketsAvailable.start,
                    end: weeklyPaymentObject.event.ticketsAvailable.end
                }
            },
            payments: [
                {
                    price: weeklyPaymentObject.price,
                    spacesBooked: weeklyPaymentObject.spacesBooked,
                }
            ]
        });
    } else {
        await WeeklyPayment.updateOne(
            {
                host: weeklyPaymentObject.host,
                'event.eventId': weeklyPaymentObject.event.eventId
            },
            {
                $push: {
                    payments: {
                        price: weeklyPaymentObject.price,
                        spacesBooked: weeklyPaymentObject.spacesBooked
                    }
                }
            }
        );
    }
}

const saveChargeWebhook = async (webhookData) => {
    const payment = await WeeklyPayment.find({ transferCode: webhookData.data.transfer_code });

    await Webhook.create(
        {
            host: payment.host,
            transferCode: webhookData.data.transfer_code,
            amount: webhookData.data.amount / 100,
            currency: webhookData.data.currency,
            paidAt: webhookData.data.paid_at,
            bank: webhookData.data.authorization.bank,
        }
    );
}

const saveTransferWebhook = async (webhookData) => {
    const tickets = await getTickets(webhookData.data.reference);

    const ticketIds = tickets.map(ticket => {
        return ticket._id;
    });

    await Webhook.create(
        {
            regularUser: tickets[0].user,
            event: tickets[0].event,
            tickets: ticketIds,
            reference: webhookData.data.reference,
            amount: webhookData.data.amount / 100,
            currency: webhookData.data.currency,
            paidAt: webhookData.data.paid_at,
            bank: webhookData.data.authorization.bank,
        }
    );
}

module.exports.PaymentFunctions = {
    processHostPayment,
    updateWeeklyPaymentDoc,
    saveChargeWebhook,
    saveTransferWebhook
}