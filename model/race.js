const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                car1Id: {
                        type: schema.Types.ObjectId,
                        ref: "car"
                },
                car2Id: {
                        type: schema.Types.ObjectId,
                        ref: "car"
                },
                car3Id: {
                        type: schema.Types.ObjectId,
                        ref: "car"
                },
                track1Id: {
                        type: schema.Types.ObjectId,
                        ref: "track"
                },
                track2Id: {
                        type: schema.Types.ObjectId,
                        ref: "track"
                },
                track3Id: {
                        type: schema.Types.ObjectId,
                        ref: "track"
                },
                noOfuser: {
                        type: Number,
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("race", userSchema);
