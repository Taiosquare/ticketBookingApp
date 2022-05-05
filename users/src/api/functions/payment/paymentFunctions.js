const amqp = require('amqplib/callback_api');
const config = require('../../../../config');
const { User } = require('../../models/user');
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

        console.log(weeklyPaymentObject);
    
        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.log(error1);

                throw error1;
            }

            const queue1 = 'Order_Created';

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

module.exports.PaymentFunctions = {
    sendWeeklyPaymentMessage,
    getPaymentDetails
}