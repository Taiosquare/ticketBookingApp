const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

const WebhookSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        regularUser: {
            type: Schema.Types.ObjectId,
            ref: "user",
        }, 

        event: {
            type: Schema.Types.ObjectId,
            ref: "event",
        },

        tickets: [
            {
                type: Schema.Types.ObjectId,
                ref: "ticket",
            }
        ],

        reference: {
            type: String,
        },
         
        host: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        
        transferCode: {
            type: String,
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