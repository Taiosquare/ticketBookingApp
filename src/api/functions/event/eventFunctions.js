require("dotenv").config();

const { Event } = require("../../models/event"),
    { Ticket } = require("../../models/ticket"),
    { User } = require("../../models/user"),
    crypto = require("crypto"),
    mongoose = require("mongoose"),
    { validationResult } = require("express-validator"),
    fetch = require("node-fetch");

const generateTickets = async (event, numOfTickets, reference, userId) => {
    let tickets = [];

    for (let i = 0; i < numOfTickets; i++) {
        let ticket = new Ticket({
            _id: mongoose.Types.ObjectId(),
            ticketNo: await crypto.randomBytes(8),
            user: userId,
            event: {
                _id: event._id,
                title: event.title,
                type: event.type,
                category: event.category,
                dates: event.dates
            },
            price: event.tickets.price,
            paymentStatus: "Initiated",
            paymentReference: reference
        })

        await ticket.save();

        // send tickets to email
        tickets.push(ticket);
    }

    const user = await User.findById(req.user._id);

    //user.email
}

const bankPayment = async (req, res, eventId) => {
    try {
        const errors = validationResult(req);
        res.setHeader('access-token', req.token);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        const { email, bank, birthday, numOfTickets } = req.body;

        const event = await Event.findById(eventId);

        const params = {
            email: email,
            amount: (event.tickets.price * numOfTickets) * 100,
            bank: bank,
            birthday: birthday
        };

        const response = await fetch(`https://api.paystack.co/charge`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params),
        });

        const response2 = await response.json();

        if (response2.status == true) {
            res.status(200).json({
                message: 'Ticket Payment has successfully been initiated, awaiting verification from user',
                reference: response2.data.reference
            });
        } else {
            res.status(400).json({
                error: 'Error: The Payment could not be initiated, please try again.',
            });
        }
    } catch (error) {
        res.status(400).json({
            error: 'Error: An error occurred while trying to initiate the payment, please try again.',
        });
    }
}

const bankPaymentVerification = async (req, res, eventId) => {
    try {
        const errors = validationResult(req);
        res.setHeader('access-token', req.token);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        const { otp, reference, numOfTickets } = req.body;

        let event = await Event.findById(eventId);

        const params = {
            otp: otp,
            reference: reference
        }

        await fetch(`https://api.paystack.co/charge/submit_otp`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params),
        });

        let response = await fetch(`https://api.paystack.co/charge/submit_otp`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params),
        });

        let response2 = await response.json();

        if (response2.status == true) {
            res.status(200).json({
                message: 'Payment has successfully been verified.',
            });

            await generateTickets(event, numOfTickets, reference, req.user._id);
        } else {
            res.status(400).json({
                error: 'Error: The Payment could not be verified, please try again.',
            });
        }
    } catch (error) {
        res.status(400).json({
            error: 'Error: An error occurred while trying to verify payment, please try again.',
        });
    }
}

const ussdPayment = async (req, res, eventId) => {
    try {
        const errors = validationResult(req);
        res.setHeader('access-token', req.token);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        const { email, ussd, numOfTickets } = req.body;

        const event = await Event.findById(eventId);

        const params = {
            email: email,
            amount: (event.tickets.price * numOfTickets) * 100,
            ussd: {
                type: ussd.type,
            }
        };

        const response = await fetch(`https://api.paystack.co/charge`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params),
        });

        const response2 = await response.json();

        if (response2.status == true) {
            res.status(200).json({
                message: 'Payment has successfully been initiated, awaiting verification from user',
                reference: response2.data.reference,
                displayText: response2.data.display_text,
                ussd: response2.data.ussd_code
            });
        } else {
            res.status(400).json({
                error: 'Error: The Payment could not be initiated, please try again.',
            });
        }
    } catch (error) {
        res.status(400).json({
            error: 'Error: An error occurred while trying to initiate the payment, please try again.',
        });
    }
}

const checkIfDateHasPassed = (eventDate) => {
    if (eventDate < new Date()) {
        return true;
    }  

    return false;
}

module.exports.EventFunctions = {
    bankPayment,
    bankPaymentVerification,
    ussdPayment,
    checkIfDateHasPassed
} 