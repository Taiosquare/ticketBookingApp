const { Event } = require("../../../models/event");
const { StandardResponse } = require("../../../helpers/standardResponse");
const { ApiCall } = require("../../../helpers/apiCall");
const { EventFunctions } = require("../../../functions/event/eventFunctions");
const config = require("../../../../../config");

const initiateEventPayment = async (requestBody, eventId) => {
    try {
        const { email, bank, birthday, spacesBooked } = requestBody;

        const event = await Event.findById(eventId);

        const params = {
            email: email,
            amount: (event.tickets.price * spacesBooked) * 100,
            bank: bank,
            birthday: birthday
        };

        const response = await ApiCall.fetchApi(
            'https://api.paystack.co/charge',
            'POST',
            config.PAYSTACK_TEST_SECRET,
            params
        );

        if (response.status == true) {
            return StandardResponse.successMessage(
                'Ticket Payment has successfully been initiated, awaiting verification from user',
                {
                    reference: response.data.reference
                }
            );
        } else {
            return StandardResponse.errorMessage("The Payment could not be initiated, please try again.");
        }
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const verifyEventPayment = async (requestBody, eventId, userId) => {
    try {
        const { otp, reference, spacesBooked } = requestBody;

        const event = await Event.findById(eventId);

        const params = {
            otp: otp,
            reference: reference
        }

        await ApiCall.fetchApi(
            'https://api.paystack.co/charge/submit_otp',
            'POST',
            config.PAYSTACK_TEST_SECRET,
            params
        );

        const response = await ApiCall.fetchApi(
            'https://api.paystack.co/charge/submit_otp',
            'POST',
            config.PAYSTACK_TEST_SECRET,
            params
        );

        if (response.status == true) {
            await EventFunctions.generateTickets(event, spacesBooked, reference, userId);

            return StandardResponse.successMessage(
                'Payment has successfully been verified.'
            );
        } else {
            return StandardResponse.errorMessage("The Payment could not be verified, please try again.");
        }
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.PaymentManager = {
    initiateEventPayment,
    verifyEventPayment
};