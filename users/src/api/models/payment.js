const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

const BankDetailsSchema = new Schema(
    {
        accountName: {
            type: String,
        },

        email: {
            type: String,
        },

        bank: {
            name: {
                type: String      
            },

            accountNumber: {
                type: String,
            },

            code: {
                type: String
            },
        },

        birthday: {
            type: String,
        },

        phoneNumber: {
            type: String
        }
    }
);

const PaymentSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        schema_version: {
            type: Number,
            default: 2,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        
        bankDetails: [
            {
                type: BankDetailsSchema
            },
        ],
        
        webhookPayments: [
            {
                type: Schema.Types.ObjectId,
                ref: "webhook",
            }
        ],

        recepientCode: String,
    },
    {
        autoCreate: true,
        strict: false,
        timestamps: true,
    }
);

const Payment = mongoose.model("payment", PaymentSchema);

module.exports = { Payment };
