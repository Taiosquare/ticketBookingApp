const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

const TicketSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        ticketID: {
            type: String,
            required: true,
        },
        
        event: {
            type: Object,
            required: true
        },
        
        price: {
            type: Number,
            required: true
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },

        isUsed: {
            type: Boolean,
            default: false
        },

        paymentStatus: {
            type: String,
            required: true
        },

        paymentReference: String,
    },
    {
      autoCreate: true,
      strict: false,
      timestamps: true,
    }
);

const Ticket = mongoose.model('ticket', TicketSchema);

module.exports = { Ticket };

