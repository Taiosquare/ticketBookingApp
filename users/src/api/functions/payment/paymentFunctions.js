const amqp = require('amqplib/callback_api');
const config = require('../../../../config');
const { Payment } = require('../../models/payment');
const { EventFunctions } = require('../../functions/event/eventFunctions');
const { UserFunctions } = require('../../functions/user/userFunctions');

const sendWeeklyPaymentMessage = async (requestBody, eventId) => {
    const event = await EventFunctions.getEventById(eventId);
    
    const weeklyPaymentObject = {
        host: event.host,
        event: {
            eventId: event._id,
            eventTitle: event.title,
            ticketsAvailable: {
                start: event.tickets.datesAvailable.start,
                end:  event.tickets.datesAvailable.start
            }
        }, 
        price: event.tickets.price,
        spacesBooked: requestBody.spacesBooked
    };

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
          
            channel.sendToQueue(queue1, Buffer.from(JSON.stringify(weeklyPaymentObject)));
        });
    });
}

const getPaymentDetails = async (userId) => {
    return await Payment.findOne({user: userId});
}

const updatePaymentDetails = async (userId, recipientCode) => {
    await Payment.updateOne(
        {
            user: userId
        },
        {
            $set: {
                recipientCode: recipientCode
            }
        }
    );
}

module.exports.PaymentFunctions = {
    sendWeeklyPaymentMessage,
    getPaymentDetails,
    updatePaymentDetails
}