const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

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