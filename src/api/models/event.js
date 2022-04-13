const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

const GeoSchema = new Schema(
    {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            index: "2dsphere",
        }
    }
);

const LocationSchema = new Schema(
    {
        _id: {
            type: ObjectId,
        },

        state: {
            type: String,
            required: true,
        },

        localGovernment: {
            type: String,
            required: true,
        },

        town: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        geometry: {
            type: GeoSchema
        }
    }
);

const DateRangeSchema = new Schema(
    {
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        }
    }
);

const RatingSchema = new Schema(
    {
        averageScore: {
            type: Number,
            default: 0
        },

        numOfRatings: {
            type: Number,
            default: 0
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

const TicketsSchema = new Schema(
    {
        datesAvailable: {
            type: DateRangeSchema,
            required: true,
        },

        totalTickets: {
            type: Number,
            required: true
        },

        availableTickets: {
            type: Number,
            required: true
        },

        price: {
            type: Number,
            required: true,
        },
    }
);

const EventSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        schema_version: {
            type: Number,
            default: 1,
        },

        title: {
            type: String,
            required: true,
            index: "text"
        },

        poster: {
            type: String,
            required: true
        },

        type: {
            type: String,
            required: true,
            index: "text"
        },

        category: {
            type: String,
            required: true,
            index: "text"
        },

        keywords: {
            type: [String]
        },

        description: {
            type: String,
            required: true
        },

        location: {
            type: LocationSchema,
        },

        tickets: {
            type: TicketsSchema,
            required: true
        },

        minimumAge: {
            type: Number,
        },

        availableSpace: {
            type: Number,
            required: true
        },

        dates: {
            type: DateRangeSchema,
        },

        rating: {
            type: RatingSchema
        },

        host: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },

        attendees: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "user",
                },

                numOfTickets: {
                    type: Number,
                }
            }
        ],

        transferCode: String
    },
    {
        autoCreate: true,
        strict: false,
        timestamps: true,
    }
);

const Event = mongoose.model('event', EventSchema);

module.exports = { Event };