const { Event } = require("../../../models/event");
const { Payment } = require("../../../models/payment");
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

const createPaymentDetails = async () => {
    try {
        const { bankDetails } = req.body;

        const paymentDetails = await Payment.findOne({
            user: req.user._id
        });

        if (paymentDetails != null) {
            return StandardResponse.errorMessage("User Payment Details already created");
        }

        const newPaymentDetails = await Payment.create({
            _id: mongoose.Types.ObjectId(),
            user: req.user._id,
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

const addPaymentDetails = async () => {
    try {
        const { bankDetails } = req.body;

        const _id = mongoose.Types.ObjectId();

        await Payment.updateOne(
            {
                user: req.user._id,
            },
            {
                $push: {
                    bankDetails: {
                        _id: _id,
                        accountName: bankDetails.accountName,
                        email: bankDetails.email,
                        bank: bankDetails.bank,
                        birthday: bankDetails.birthday,
                        phoneNumber: bankDetails.phoneNumber
                    }
                }
            }
        );
  
        bankDetails._id = _id; 

        return StandardResponse.successMessage(
            "Payment Details sucessfully added",
            { bankDetails: bankDetails }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.PaymentManager = {
    initiateEventPayment,
    verifyEventPayment,
    createPaymentDetails,
    addPaymentDetails
};