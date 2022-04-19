// Workflow

// Whenever a payment is made, a webhook document is created with details
// such as (userId, hostId, eventId, transfercode, reference etc)

// After the payment is confirmed by the gateway, the document that was
// created earlier will then be updated with details of the webhook

// The 'eventPayments' array in the Payment model should contain these
// webhooks

const mongoose = require("mongoose"),
    { ObjectId } = require("mongodb"),
    Schema = mongoose.Schema;

const WebhookSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        buyer: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        }, 

        host: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },

        event: {
            type: Schema.Types.ObjectId,
            ref: "event",
            required: true,
        },

        tickets: [
            {
                type: Schema.Types.ObjectId,
                ref: "ticket",
            }
        ],

        transferCode: {
            type: String,
            required: true,
        },

        reference: {
            type: String,
            required: true,
        },

        amount: {
            type: String,
            required: true,
        },

        currency: {
            type: String,
            required: true
        },

        paidAt: {
            type: Date,
            required: true
        },

        bank: {
            type: String,
            required: true
        },
    },
    {
        autoCreate: true,
        strict: false,
        timestamps: true,
    }
);

const Webhook = mongoose.model("webhook", WebhookSchema);

module.exports = { Webhook };