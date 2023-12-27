const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const randomatic = require("randomatic");
const User = require("./model/userModel");
const Car = require("./model/car");
const Speed = require("./model/speed");
const Race = require("./model/race");
const Bet = require("./model/bets");
const Track = require("./model/track");
const winingSenario = require("./model/winingSenario");
const raceStart = require("./model/raceStart");
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV == "production") {
        console.log = function () { };
}
app.get("/", (req, res) => {
        res.send("Hello World!");
});

const createRace = async () => {
        try {
                let car1, car2, car3, speed1track1Id, speed2track1Id, speed3track1Id, speed1track2Id, speed1track3Id, speed2track2Id, speed2track3Id, speed3track2Id, speed3track3Id;;
                let car1noOfTrack1, car1noOfTrack2, car1noOfTrack3, car2noOfTrack1, car2noOfTrack2, car2noOfTrack3, car3noOfTrack1, car3noOfTrack2, car3noOfTrack3;
                let findOne = await Race.findOne({ status: 'pending' }).populate([{ path: 'car1.car', select: 'name image victory odds' }, { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.car', select: 'name image victory odds' }, { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.car', select: 'name image victory odds' }, { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },]);
                if (findOne) {
                        console.log('Race found successfully.', findOne);
                } else {
                        const firstTrack = Math.floor(Math.random() * 3) + 1;
                        let totalRace = await Race.find({}).count();
                        let raceNo = (totalRace % 10) + 1;
                        if (raceNo == 1) {
                                function generateRandomIndices(maxCount, medCount, lowCount, maxIndex) {
                                        const getRandomIndices = (count, exclude) => {
                                                const indices = [];
                                                while (indices.length < count) {
                                                        const randomIndex = Math.floor(Math.random() * maxIndex) + 1;
                                                        if (!indices.includes(randomIndex) && !exclude.includes(randomIndex)) {
                                                                indices.push(randomIndex);
                                                                exclude.push(randomIndex);
                                                        }
                                                }
                                                return indices;
                                        };
                                        const allIndices = [];
                                        return { max: getRandomIndices(maxCount, allIndices), med: getRandomIndices(medCount, allIndices), low: getRandomIndices(lowCount, allIndices) };
                                }
                                const result12 = generateRandomIndices(6, 3, 1, 10);
                                if ((result12.low.length == 1) && (result12.med.length == 3) && (result12.max.length == 6)) {
                                        let findWiningSenario = await winingSenario.findOne();
                                        if (findWiningSenario) {
                                                let update = await winingSenario.findByIdAndUpdate({ _id: findWiningSenario._id }, { $set: { max: result12.max, med: result12.med, low: result12.low } }, { new: true })
                                        } else {
                                                await winingSenario.create({ max: result12.max, med: result12.med, low: result12.low });
                                        }
                                }
                        }
                        const cars = await Car.aggregate([{ $sample: { size: 3 } }]);
                        const track = await Track.aggregate([{ $sample: { size: 1 } }]);
                        if (cars.length > 0) {
                                function distributeRandomlyWithoutZero(total, parts) {
                                        let distribution = Array(parts).fill(1);
                                        for (let i = 0; i < total - parts; i++) {
                                                let index;
                                                do {
                                                        index = Math.floor(Math.random() * parts);
                                                } while (distribution[index] === 0);
                                                distribution[index]++;
                                        }
                                        return distribution;
                                }
                                const distribution = distributeRandomlyWithoutZero(6, 3);
                                [car1noOfTrack1, car1noOfTrack2, car1noOfTrack3] = distribution;
                                for (let i = 0; i < cars.length; i++) {
                                        if (i === 0) {
                                                car1 = cars[0]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[0]._id });
                                                if (firstTrack == 1) {
                                                        speed1track1Id = speed._id;
                                                        speed1track2Id = null;
                                                        speed1track3Id = null;
                                                }
                                                if (firstTrack == 2) {
                                                        speed1track1Id = null;
                                                        speed1track2Id = speed._id;
                                                        speed1track3Id = null;
                                                }
                                                if (firstTrack == 3) {
                                                        speed1track1Id = null;
                                                        speed1track2Id = null;
                                                        speed1track3Id = speed._id;
                                                }
                                        } else if (i === 1) {
                                                car2 = cars[1]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[1]._id });
                                                speed2track1Id = speed._id;
                                                if (firstTrack == 1) {
                                                        speed2track1Id = speed._id;
                                                        speed2track2Id = null;
                                                        speed2track3Id = null;
                                                }
                                                if (firstTrack == 2) {
                                                        speed2track1Id = null;
                                                        speed2track2Id = speed._id;
                                                        speed2track3Id = null;
                                                }
                                                if (firstTrack == 3) {
                                                        speed2track1Id = null;
                                                        speed2track2Id = null;
                                                        speed2track3Id = speed._id;
                                                }
                                        } else {
                                                car3 = cars[2]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[2]._id });
                                                if (firstTrack == 1) {
                                                        speed3track1Id = speed._id;
                                                        speed3track2Id = null;
                                                        speed3track3Id = null;
                                                }
                                                if (firstTrack == 2) {
                                                        speed3track1Id = null;
                                                        speed3track2Id = speed._id;
                                                        speed3track3Id = null;
                                                }
                                                if (firstTrack == 3) {
                                                        speed3track1Id = null;
                                                        speed3track2Id = null;
                                                        speed3track3Id = speed._id;
                                                }
                                        }
                                }
                                let obj250 = {
                                        car1: {
                                                car: car1,
                                                track1Id: speed1track1Id,
                                                track2Id: speed1track2Id,
                                                track3Id: speed1track3Id,
                                                noOfTrack1: car1noOfTrack1,
                                                noOfTrack2: car1noOfTrack2,
                                                noOfTrack3: car1noOfTrack3,
                                        },
                                        car2: {
                                                car: car2,
                                                track1Id: speed2track1Id,
                                                track2Id: speed2track2Id,
                                                track3Id: speed2track3Id,
                                                noOfTrack1: car1noOfTrack1,
                                                noOfTrack2: car1noOfTrack2,
                                                noOfTrack3: car1noOfTrack3,
                                        },
                                        car3: {
                                                car: car3,
                                                track1Id: speed3track1Id,
                                                track2Id: speed3track2Id,
                                                track3Id: speed3track3Id,
                                                noOfTrack1: car1noOfTrack1,
                                                noOfTrack2: car1noOfTrack2,
                                                noOfTrack3: car1noOfTrack3,
                                        },
                                        raceNo: raceNo,
                                        raceId: await reffralCode(),
                                        track1Id: track._id,
                                        status: 'pending',
                                        firstTrack: firstTrack,
                                }
                                const createdRace = await Race.create(obj250);
                                let car6 = await Race.findOne({ _id: createdRace._id }).populate([
                                        { path: 'car1.car', select: 'name image victory odds' },
                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.car', select: 'name image victory odds' },
                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.car', select: 'name image victory odds' },
                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                ]);
                                let findRaceStart = await raceStart.findOne();
                                if (findRaceStart) {
                                        console.log("raceStartTime", new Date(Date.now() + 40 * 1000), "raceCompleteTime", new Date(Date.now() + 60 * 1000));

                                        await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: false, raceStartTime: new Date(Date.now() + 40 * 1000), raceCompleteTime: new Date(Date.now() + 60 * 1000) } }, { new: true });
                                } else {
                                        await raceStart.create({ raceStart: false, raceStartTime: new Date(Date.now() + 40 * 1000), raceCompleteTime: new Date(Date.now() + 60 * 1000) });
                                }
                                if (car6) {
                                        console.log('Race created successfully.', car6);
                                }
                        }
                }
        } catch (error) {
                console.error('Error creating race:', error);
        }
};
setInterval(async () => {
        console.log("-----------call out function---------");
        await createRace();
}, 60000);
const raceStarted = async () => {
        try {
                let findRaceStart1 = await raceStart.findOne();
                if (findRaceStart1) {
                        if (findRaceStart1.raceStartTime <= Date.now()) {
                                const user100 = await Race.findOne({ status: "pending" }).populate([{ path: 'car1.car', select: 'name image victory  odds' }, { path: 'car2.car', select: 'name image victory  odds' }, { path: 'car3.car', select: 'name image victory  odds' },]);;
                                const user = await Race.findOne({ status: "pending" });
                                if (!user) {
                                        console.log({ status: 404, message: "Race not found", data: {} });
                                } else {
                                        let car1Name = user100.car1.car.name, car2Name = user100.car2.car.name, car3Name = user100.car3.car.name;
                                        console.log(car1Name, car2Name, car3Name);
                                        let speed1track1Id, speed1track2Id, speed1track3Id, speed2track1Id, speed2track2Id, speed2track3Id, speed3track1Id, speed3track2Id, speed3track3Id;
                                        const betAmounts = [user.car1BetAmount, user.car2BetAmount, user.car3BetAmount];
                                        const maxBetAmount = Math.max(...betAmounts);
                                        const minBetAmount = Math.min(...betAmounts);
                                        const mediumBetAmount = betAmounts.reduce((acc, val) => acc + val, 0) - maxBetAmount - minBetAmount;
                                        const maxBetEnum = findEnum(maxBetAmount, betAmounts);
                                        const mediumBetEnum = findEnum(mediumBetAmount, betAmounts);
                                        const minBetEnum = findEnum(minBetAmount, betAmounts);
                                        function findEnum(amount, amounts) {
                                                const index = amounts.indexOf(amount);
                                                return ["I", "II", "III"][index];
                                        }
                                        let findWiningSenario = await winingSenario.findOne();
                                        if (findWiningSenario.max.includes(user.raceNo)) {
                                                console.log("max");
                                                if (maxBetAmount === user.car1BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car1.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                speed1track2Id = speed2[0]._id;
                                                                speed1track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track1Id = speed2[0]._id;
                                                                speed1track2Id = user.car1.track2Id;
                                                                speed1track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track1Id = speed2[0]._id;
                                                                speed1track2Id = speed2[1]._id;
                                                                speed1track3Id = user.car1.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed2track1Id = user.car2.track1Id;
                                                                        if (i == 0) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed2track2Id = user.car2.track2Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed2track3Id = user.car2.track3Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed3track1Id = user.car3.track1Id;
                                                                        if (i == 0) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed3track2Id = user.car3.track2Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed3track3Id = user.car3.track3Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "max",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: user._id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                } else if (maxBetAmount === user.car2BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car2.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                speed2track2Id = speed2[0]._id;
                                                                speed2track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track1Id = speed2[0]._id;
                                                                speed2track2Id = user.car2.track2Id;
                                                                speed2track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track1Id = speed2[0]._id;
                                                                speed2track2Id = speed2[1]._id;
                                                                speed2track3Id = user.car2.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed1track1Id = user.car1.track1Id;
                                                                        if (i == 0) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed1track2Id = user.car1.track2Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed1track3Id = user.car1.track3Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed3track1Id = user.car3.track1Id;
                                                                        if (i == 0) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed3track2Id = user.car3.track2Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed3track3Id = user.car3.track3Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "max",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                } else if (maxBetAmount === user.car3BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car3.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                speed3track2Id = speed2[0]._id;
                                                                speed3track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track1Id = speed2[0]._id;
                                                                speed3track2Id = user.car3.track2Id;
                                                                speed3track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track1Id = speed2[0]._id;
                                                                speed3track2Id = speed2[1]._id;
                                                                speed3track3Id = user.car3.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed1track1Id = user.car1.track1Id;
                                                                        if (i == 0) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed1track2Id = user.car1.track2Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed1track3Id = user.car1.track3Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed2track1Id = user.car2.track1Id;
                                                                        if (i == 0) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed2track2Id = user.car2.track2Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed2track3Id = user.car2.track3Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "max",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                }
                                        }
                                        if (findWiningSenario.med.includes(user.raceNo)) {
                                                console.log("med");
                                                if (mediumBetAmount === user.car1BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car1.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                speed1track2Id = speed2[0]._id;
                                                                speed1track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track1Id = speed2[0]._id;
                                                                speed1track2Id = user.car1.track2Id;
                                                                speed1track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track1Id = speed2[0]._id;
                                                                speed1track2Id = speed2[1]._id;
                                                                speed1track3Id = user.car1.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed2track1Id = user.car2.track1Id;
                                                                        if (i == 0) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed2track2Id = user.car2.track2Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed2track3Id = user.car2.track3Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed3track1Id = user.car3.track1Id;
                                                                        if (i == 0) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed3track2Id = user.car3.track2Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed3track3Id = user.car3.track3Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "med",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: user._id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                } else if (mediumBetAmount === user.car2BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car2.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                speed2track2Id = speed2[0]._id;
                                                                speed2track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track1Id = speed2[0]._id;
                                                                speed2track2Id = user.car2.track2Id;
                                                                speed2track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track1Id = speed2[0]._id;
                                                                speed2track2Id = speed2[1]._id;
                                                                speed2track3Id = user.car2.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed1track1Id = user.car1.track1Id;
                                                                        if (i == 0) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed1track2Id = user.car1.track2Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed1track3Id = user.car1.track3Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed3track1Id = user.car3.track1Id;
                                                                        if (i == 0) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed3track2Id = user.car3.track2Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed3track3Id = user.car3.track3Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "med",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                } else if (mediumBetAmount === user.car3BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car3.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                speed3track2Id = speed2[0]._id;
                                                                speed3track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track1Id = speed2[0]._id;
                                                                speed3track2Id = user.car3.track2Id;
                                                                speed3track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track1Id = speed2[0]._id;
                                                                speed3track2Id = speed2[1]._id;
                                                                speed3track3Id = user.car3.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed1track1Id = user.car1.track1Id;
                                                                        if (i == 0) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed1track2Id = user.car1.track2Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed1track3Id = user.car1.track3Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed2track1Id = user.car2.track1Id;
                                                                        if (i == 0) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed2track2Id = user.car2.track2Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed2track3Id = user.car2.track3Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "med",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                }
                                        }
                                        if (findWiningSenario.low.includes(user.raceNo)) {
                                                console.log("low");
                                                if (minBetAmount === user.car1BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car1.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                speed1track2Id = speed2[0]._id;
                                                                speed1track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track1Id = speed2[0]._id;
                                                                speed1track2Id = user.car1.track2Id;
                                                                speed1track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track1Id = speed2[0]._id;
                                                                speed1track2Id = speed2[1]._id;
                                                                speed1track3Id = user.car1.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed2track1Id = user.car2.track1Id;
                                                                        if (i == 0) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed2track2Id = user.car2.track2Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed2track3Id = user.car2.track3Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed3track1Id = user.car3.track1Id;
                                                                        if (i == 0) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed3track2Id = user.car3.track2Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed3track3Id = user.car3.track3Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "low",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                } else if (minBetAmount === user.car2BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car2.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                speed2track2Id = speed2[0]._id;
                                                                speed2track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track1Id = speed2[0]._id;
                                                                speed2track2Id = user.car2.track2Id;
                                                                speed2track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track1Id = speed2[0]._id;
                                                                speed2track2Id = speed2[1]._id;
                                                                speed2track3Id = user.car2.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed1track1Id = user.car1.track1Id;
                                                                        if (i == 0) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed1track2Id = user.car1.track2Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed1track3Id = user.car1.track3Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed3track1Id = user.car3.track1Id;
                                                                        if (i == 0) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed3track2Id = user.car3.track2Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed3track3Id = user.car3.track3Id;
                                                                        if (i == 0) {
                                                                                speed3track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed3track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "low",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                } else if (minBetAmount === user.car3BetAmount) {
                                                        const speed2 = await Speed.find({ carId: user.car3.car }).sort({ speed: -1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                speed3track2Id = speed2[0]._id;
                                                                speed3track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track1Id = speed2[0]._id;
                                                                speed3track2Id = user.car3.track2Id;
                                                                speed3track3Id = speed2[1]._id;
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track1Id = speed2[0]._id;
                                                                speed3track2Id = speed2[1]._id;
                                                                speed3track3Id = user.car3.track3Id;
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed1track1Id = user.car1.track1Id;
                                                                        if (i == 0) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed1track2Id = user.car1.track2Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed1track3Id = user.car1.track3Id;
                                                                        if (i == 0) {
                                                                                speed1track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed1track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        for (let i = 0; i < speed2.length; i++) {
                                                                const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                                if (user.firstTrack == 1) {
                                                                        speed2track1Id = user.car2.track1Id;
                                                                        if (i == 0) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 2) {
                                                                        speed2track2Id = user.car2.track2Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track3Id = speed1._id;
                                                                        }
                                                                }
                                                                if (user.firstTrack == 3) {
                                                                        speed2track3Id = user.car2.track3Id;
                                                                        if (i == 0) {
                                                                                speed2track1Id = speed1._id;
                                                                        }
                                                                        if (i == 1) {
                                                                                speed2track2Id = speed1._id;
                                                                        }
                                                                }
                                                        }
                                                        if (minBetEnum == "I") {
                                                                winCar = car1Name;
                                                        } else if (minBetEnum == "II") {
                                                                winCar = car2Name;
                                                        } else {
                                                                winCar = car3Name;
                                                        }
                                                        let obj = {
                                                                car1: {
                                                                        car: user.car1.car,
                                                                        track1Id: speed1track1Id,
                                                                        track2Id: speed1track2Id,
                                                                        track3Id: speed1track3Id,
                                                                        noOfTrack1: user.car1.noOfTrack1,
                                                                        noOfTrack2: user.car1.noOfTrack2,
                                                                        noOfTrack3: user.car1.noOfTrack3,
                                                                },
                                                                car2: {
                                                                        car: user.car2.car,
                                                                        track1Id: speed2track1Id,
                                                                        track2Id: speed2track2Id,
                                                                        track3Id: speed2track3Id,
                                                                        noOfTrack1: user.car2.noOfTrack1,
                                                                        noOfTrack2: user.car2.noOfTrack2,
                                                                        noOfTrack3: user.car2.noOfTrack3,
                                                                },
                                                                car3: {
                                                                        car: user.car3.car,
                                                                        track1Id: speed3track1Id,
                                                                        track2Id: speed3track2Id,
                                                                        track3Id: speed3track3Id,
                                                                        noOfTrack1: user.car3.noOfTrack1,
                                                                        noOfTrack2: user.car3.noOfTrack2,
                                                                        noOfTrack3: user.car3.noOfTrack3,
                                                                },
                                                                status: "started",
                                                                maximum: maxBetEnum,
                                                                medium: mediumBetEnum,
                                                                lowest: minBetEnum,
                                                                win: "low",
                                                                winCar: winCar
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: true, } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: true, });
                                                        }
                                                        let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                                { path: 'car1.car', select: 'name image victory  odds' },
                                                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.car', select: 'name image victory  odds' },
                                                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.car', select: 'name image victory  odds' },
                                                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        ]);
                                                        console.log({ status: 200, message: "car 1", data: findOne1 });
                                                }
                                        }
                                }
                        }
                }
        } catch (error) {
                console.error('Error creating race:', error);
        }
};
setInterval(async () => {
        console.log("-----------call out function 2---------");
        await raceStarted();
}, 40000);
const raceCompleted = async () => {
        try {
                let findRaceStart1 = await raceStart.findOne();
                if (findRaceStart1) {
                        if (findRaceStart1.raceCompleteTime <= Date.now()) {
                                const user = await Race.findOne({ status: "started" });
                                if (!user) {
                                        console.log({ status: 404, message: "Race  not found ", data: {}, });
                                } else {
                                        let findBet = await Bet.find({ raceId: user._id }).populate([{ path: 'car1Id', select: 'name image victory  odds' }, { path: 'car2Id', select: 'name image victory  odds' }, { path: 'car3Id', select: 'name image victory  odds' },]);
                                        if (findBet.length > 0) {
                                                if (user.win == "max") {
                                                        let winningCar = user.maximum
                                                        for (let i = 0; i < findBet.length; i++) {
                                                                if (findBet[i].betOn == "I") {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car1Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                }
                                                                else if (findBet[i].betOn == "II") {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car2Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                } else {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car3Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                }
                                                                console.log(findBet[i]);
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                console.log("raceStartTime", new Date(Date.now() + 40 * 1000), "raceCompleteTime", new Date(Date.now() + 60 * 1000));

                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: false } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: false });
                                                        }
                                                        await createRace();
                                                        console.log({ status: 200, message: "Race complete", data: update, });
                                                }
                                                if (user.win == "med") {
                                                        let winningCar = user.medium
                                                        for (let i = 0; i < findBet.length; i++) {
                                                                if (findBet[i].betOn == "I") {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car1Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                }
                                                                else if (findBet[i].betOn == "II") {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car2Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                } else {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car3Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                }
                                                                console.log(findBet[i]);
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                console.log("raceStartTime", new Date(Date.now() + 40 * 1000), "raceCompleteTime", new Date(Date.now() + 60 * 1000));

                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: false } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: false });
                                                        }
                                                        await createRace();
                                                        console.log({ status: 200, message: "Race complete", data: update, });
                                                }
                                                if (user.win == "low") {
                                                        let winningCar = user.lowest
                                                        for (let i = 0; i < findBet.length; i++) {
                                                                if (findBet[i].betOn == "I") {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car1Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                }
                                                                else if (findBet[i].betOn == "II") {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car2Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                } else {
                                                                        if (findBet[i].betOn == winningCar) {
                                                                                findBet[i].status = "win";
                                                                                findBet[i].winAmount = findBet[i].betAmount * findBet[i].car3Id.odds;
                                                                                findBet[i].save();
                                                                        } else {
                                                                                findBet[i].status = "loss";
                                                                                findBet[i].winAmount = 0;
                                                                                findBet[i].save();
                                                                        }
                                                                }
                                                        }
                                                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                                                        let findRaceStart = await raceStart.findOne();
                                                        if (findRaceStart) {
                                                                await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: false } }, { new: true });
                                                        } else {
                                                                await raceStart.create({ raceStart: false });
                                                        }
                                                        await createRace();
                                                        console.log({ status: 200, message: "Race complete", data: update, });
                                                }
                                        } else {
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                                                let findRaceStart = await raceStart.findOne();
                                                if (findRaceStart) {
                                                        await raceStart.findByIdAndUpdate({ _id: findRaceStart._id }, { $set: { raceStart: false } }, { new: true });
                                                } else {
                                                        await raceStart.create({ raceStart: false });
                                                }
                                                await createRace();
                                                console.log({ status: 200, message: "Race complete", data: update, });
                                        }
                                }
                        }
                }
        } catch (error) {
                console.log({ status: 500, message: "Server error", data: error, });
        }
};
setInterval(async () => {
        console.log("-----------call out function 3---------");
        await raceCompleted();
}, 20000);
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
require('./routes/userRoutes')(app);
require('./routes/adminRoute')(app);
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URI).then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host} : carRacing`);
});
app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}!`);
});
module.exports = { handler: serverless(app) };
