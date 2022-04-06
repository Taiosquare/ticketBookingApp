const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

const DocumentSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },

        link: {
            type: String,
            required: true,
        },
    }
);

const RatingSchema = new Schema(
    {
        averageScore: {
            type: Number
        },

        numOfRatings: {
            type: Number
        },

        ratings: [
            {
                score: {
                    type: Number,
                },
                
                user: {
                    type: Schema.Types.ObjectId,
                } 
            }
        ],
    }
)

const RatedEventSchema = new Schema(
    {
        event: {
            type: Schema.Types.ObjectId,
            ref: "event",
        },

        rating: {
            type: Number,
        },
    }
)

const BookedEventSchema = new Schema(
    {
        event: {
            type: Schema.Types.ObjectId,
            ref: "event",
        },

        spacesReserved: {
            type: Number,
            required: true,
        },
    }
)

const BusinessDetailsSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        type: {
            type: String,
        },

        description: {
            type: String,
            required: true
        },

        website: {
            type: String,
        },

        landline: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        profilePicture: {
            type: String,
        },

        events: [
            {
                type: Schema.Types.ObjectId,
                ref: "event",
            },
        ],

        documents: [
            {
                type: DocumentSchema
            }
        ],
    }
)

const UserSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        schema_version: {
            type: Number,
            default: 1,
        },

        role: {
            type: String,
            enum: [
                'admin',
                'host',
                'regularUser',
                'superAdmin'
            ],
        },

        username: {
            type: String,
            trim: true,
            unique: true,
        },
       
        firstname: {
            type: String,
            trim: true,
            required: true
        },

        lastname: {
            type: String,
            trim: true,
            required: true
        },
       
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        position: {
            type: String,
            trim: true,
        },

        profilePicture: {
            type: String,
        },

        accountApproved: {
            type: Boolean,
            default: false,
        },

        accountSuspended: {
            type: Boolean,
            default: false,
        },  

        emailVerified: {
            type: Boolean,
            default: false,
        },

        superAdmin: {
            type: Boolean,
            default: false,
        },

        businessDetails: {
            type: BusinessDetailsSchema
        },

        bookedEvents: [
            {
                type: BookedEventSchema
            }
        ],

        ratedEvents: [
            {
                type: RatedEventSchema
            }
        ],

        rating: {
            type: RatingSchema
        },

        token: String,

        confirmationToken: String,

        confirmTokenExpiration: Date,

        resetToken: String,

        resetTokenExpiration: Date,
    },
    {
        autoCreate: true,
        strict: false,
        timestamps: true,
    }
);

const User = mongoose.model("user", UserSchema);

module.exports = { User };