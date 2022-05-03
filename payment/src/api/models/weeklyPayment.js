const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = require("mongodb");

// The document will be deleted after the all the payments have been made
// & the event date has passed

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
            type: Schema.Types.ObjectId
        },

        // host: {
        //     hostId: {
        //         type: Schema.Types.ObjectId,
        //     },

        //     hostName: {
        //         type: String,
        //         required: true
        //     }
        // },

        event: {
            eventId: {
                type: Schema.Types.ObjectId,
            },

            eventTitle: {
                type: String,
                required: true
            },

            ticketsAvailable: {
                start: {
                    type: Date,
                    required: true
                },
                end: {
                    type: Date,
                    required: true
                }
            }
        },

        payments: [
            {
                price: {
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
