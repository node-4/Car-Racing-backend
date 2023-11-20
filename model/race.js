const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                raceId: {
                        type: String,
                },
                car1: {
                        car: {
                                type: schema.Types.ObjectId,
                                ref: "car"
                        },
                        track1Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track2Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track3Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                },
                car2: {
                        car: {
                                type: schema.Types.ObjectId,
                                ref: "car"
                        },
                        track1Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track2Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track3Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                },
                car3: {
                        car: {
                                type: schema.Types.ObjectId,
                                ref: "car"
                        },
                        track1Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track2Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track3Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                },
                noOfuser: {
                        type: Number,
                        default: 0
                },
                betsAmount: {
                        type: Number,
                        default: 0
                },
                car1BetAmount: {
                        type: Number,
                        default: 0
                },
                car2BetAmount: {
                        type: Number,
                        default: 0
                },
                car3BetAmount: {
                        type: Number,
                        default: 0
                },
                status: {
                        type: String,
                        enum: ["pending", "started", "completed"],
                        default: "pending"
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("race", userSchema);
