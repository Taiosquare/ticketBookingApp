const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = require("mongodb");

const WeeklyPaymentSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        schema_version: {
            type: Number,
            default: 1,
        },

        host: {
            hostId: {
                type: Schema.Types.ObjectId,
            },

            hostName: {
                type: String,
                required: true
            }
        },

        event: {
            eventId: {
                type: Schema.Types.ObjectId,
            },

            eventName: {
                type: String,
                required: true
            }
        },

        payments: [
            {
                amount: {
                    type: Number,
                    required: true
                },

                spacesBooked: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    {
        autoCreate: true,
        strict: false,
        timestamps: true,
    }
);

const WeeklyPayment = mongoose.model("weeklyPayment", WeeklyPaymentSchema);

module.exports = { WeeklyPayment };
