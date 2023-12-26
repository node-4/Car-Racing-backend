const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                raceStart: {
                        type: Boolean,
                        default: false
                },
                raceStartTime: {
                        type: Date,
                },
                raceCompleteTime: {
                        type: Date,
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("raceStart", userSchema);
