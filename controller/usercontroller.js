const jwt = require("jsonwebtoken");
const randomatic = require("randomatic");
const User = require("../model/userModel");
const Car = require("../model/car");
const Speed = require("../model/speed");
const Race = require("../model/race");
const Bet = require("../model/bets");
exports.socialLogin = async (req, res) => {
        try {
                let userData = await User.findOne({ $or: [{ mobileNumber: req.body.mobileNumber }, { socialId: req.body.socialId }, { socialType: req.body.socialType }] });
                if (userData) {
                        let updateResult = await User.findByIdAndUpdate({ _id: userData._id }, { $set: { deviceToken: req.body.deviceToken } }, { new: true });
                        if (updateResult) {
                                const token = jwt.sign({ id: updateResult._id }, "node5flyweis");
                                let obj = {
                                        _id: updateResult._id,
                                        firstName: updateResult.firstName,
                                        lastName: updateResult.lastName,
                                        socialId: updateResult.socialId,
                                        userType: updateResult.userType,
                                        token: token
                                }
                                return res.status(200).send({ status: 200, message: "Login successfully ", data: obj, });
                        }
                } else {
                        req.body.firstName = req.body.firstName;
                        req.body.lastName = req.body.lastName;
                        req.body.mobileNumber = req.body.mobileNumber;
                        let email = req.body.email;
                        req.body.email = email.split(" ").join("").toLowerCase();
                        req.body.socialId = req.body.socialId;
                        req.body.socialType = req.body.socialType;
                        req.body.refferalCode = await reffralCode();
                        let saveUser = await User(req.body).save();
                        if (saveUser) {
                                const token = jwt.sign({ id: saveUser._id }, "node5flyweis");
                                let obj = {
                                        _id: saveUser._id,
                                        firstName: saveUser.firstName,
                                        lastName: saveUser.lastName,
                                        mobileNumber: saveUser.mobileNumber,
                                        userType: saveUser.userType,
                                        token: token
                                }
                                return res.status(200).send({ status: 200, message: "Login successfully ", data: obj, });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.loginUser = async (req, res) => {
        try {
                const { mobileNumber } = req.body;
                let user = await User.findOne({ mobileNumber });
                if (!user) {
                        const otp = randomatic("0", 4);
                        let refferalCode = await reffralCode();
                        user = new User({ mobileNumber, otp, refferalCode });
                        await user.save();
                        const token = jwt.sign({ id: user._id }, "node5flyweis");
                        return res.status(200).send({ status: 200, message: "OTP generated and sent to the user.", data: { user, token }, });
                } else {
                        const otp = randomatic("0", 4);
                        user.otp = otp;
                        user.isVerified = false;
                        await user.save();
                        const token = jwt.sign({ id: user._id }, "node5flyweis");
                        return res.status(200).send({ status: 200, message: "OTP generated and sent to the user.", data: { user, token }, });
                }
        } catch (error) {
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.verifyOtplogin = async (req, res) => {
        try {
                const { mobileNumber, otp } = req.body;
                const user = await User.findOne({ mobileNumber });
                if (!user) {
                        return res.status(404).json({ error: "User not found" });
                }
                if (otp === user.otp) {
                        const token = jwt.sign({ id: user._id }, "node5flyweis");
                        user.otp = undefined;
                        user.isVerified = true;
                        await user.save();
                        return res.status(200).send({ status: 200, message: "OTP verification successful", data: { user, token }, });
                } else {
                        return res.status(401).send({ status: 401, message: "Invalid OTP", data: {}, });
                }
        } catch (error) {
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.getUserDetails = async (req, res) => {
        try {
                const user = await User.findById(req.user._id);
                if (!user) {
                        return res.status(404).send({ status: 404, message: "user not found ", data: {}, });
                } else {
                        return res.status(200).send({ status: 200, message: "get profile ", data: user, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.updateUserDetails = async (req, res) => {
        try {
                const user = await User.findById(req.user._id);
                if (!user) {
                        return res.status(404).send({ status: 404, message: "user not found ", data: {}, });
                } else {
                        const { fullName, firstName, lastName, email, mobileNumber, address, city, state, country, pincode } = req.body;
                        uswe.fullName = fullName || user.fullName;
                        user.firstName = firstName || user.firstName;
                        user.lastName = lastName || user.lastName;
                        user.email = email || user.email;
                        user.mobileNumber = mobileNumber || user.mobileNumber;
                        user.address = address || user.address;
                        user.city = city || user.city;
                        user.state = state || user.state;
                        user.country = country || user.country;
                        user.pincode = pincode || user.pincode;
                        await user.save();
                        return res.status(200).send({ status: 200, message: "Profile updated successfully", data: user, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.createRace = async (req, res) => {
        try {
                let car1, car2, car3, speed1track1Id, speed1track2Id, speed1track3Id, speed2track1Id, speed2track2Id, speed2track3Id, speed3track1Id, speed3track2Id, speed3track3Id;
                let findOne = await Race.findOne({ status: 'pending' }).populate([
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
                if (findOne) {
                        return res.status(200).send({ status: 200, message: "race find successfully.", data: findOne, });
                } else {
                        const cars = await Car.aggregate([{ $sample: { size: 3 } }]);
                        if (cars.length > 0) {
                                for (let i = 0; i < cars.length; i++) {
                                        console.log(cars[i]._id);
                                        car1 = cars[0]._id;
                                        car2 = cars[1]._id;
                                        car3 = cars[2]._id;
                                        const speed = await Speed.aggregate([{ $match: { carId: cars[i]._id } }, { $sample: { size: 3 } },]);
                                        for (let j = 0; j < speed.length; j++) {
                                                if (i == 0) {
                                                        speed1track1Id = speed[0]._id;
                                                        speed1track2Id = speed[1]._id;
                                                        speed1track3Id = speed[2]._id;
                                                } else if (i == 1) {
                                                        speed2track1Id = speed[0]._id;
                                                        speed2track2Id = speed[1]._id;
                                                        speed2track3Id = speed[2]._id;
                                                } else if (i == 2) {
                                                        speed3track1Id = speed[0]._id;
                                                        speed3track2Id = speed[1]._id;
                                                        speed3track3Id = speed[2]._id;
                                                }
                                        }
                                }
                        }
                        req.body.raceId = await reffralCode();
                        req.body.car1 = {
                                car: car1,
                                track1Id: speed1track1Id,
                                track2Id: speed1track2Id,
                                track3Id: speed1track3Id,
                        };
                        req.body.car2 = {
                                car: car2,
                                track1Id: speed2track1Id,
                                track2Id: speed2track2Id,
                                track3Id: speed2track3Id,
                        };
                        req.body.car3 = {
                                car: car3,
                                track1Id: speed3track1Id,
                                track2Id: speed3track2Id,
                                track3Id: speed3track3Id,
                        };
                        const car = await Race.create(req.body);
                        let car6 = await Race.findOne({ _id: car._id }).populate([
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
                        if (car6) {
                                return res.status(200).send({ status: 200, message: "race find successfully.", data: car6, });
                        }
                }
        } catch (error) {
                console.error("Error creating race:", error);
        }
};
exports.getRaceByid = async (req, res) => {
        try {
                const user = await Race.findById({ _id: req.params.id }).select('noOfuser betsAmount car1BetAmount car2BetAmount car3BetAmount');
                if (!user) {
                        return res.status(404).send({ status: 404, message: "Race  not found ", data: {}, });
                } else {
                        return res.status(200).send({ status: 200, message: "Race start", data: update, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.getRace = async (req, res) => {
        try {
                let findSpeed = await Race.find({}).populate([{ path: 'car1.car', select: 'name image victory  odds' }, { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.car', select: 'name image victory  odds' }, { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.car', select: 'name image victory  odds' }, { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },]); if (findSpeed.length === 0) {
                        return res.status(404).send({ status: 404, message: "Speed not found", data: {} });
                }
                return res.status(200).send({ status: 200, message: "Speed found", data: findSpeed });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
        }
};
exports.raceStart = async (req, res) => {
        try {
                const user = await Race.findById({ _id: req.params.id });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "Race  not found ", data: {}, });
                } else {
                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "Started" }, { new: true })
                        return res.status(200).send({ status: 200, message: "Race start", data: update, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.raceCompleted = async (req, res) => {
        try {
                const user = await Race.findById({ _id: req.params.id });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "Race  not found ", data: {}, });
                } else {
                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                        return res.status(200).send({ status: 200, message: "Race complete", data: update, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.addBets = async (req, res) => {
        try {
                let { raceId, carId, selectedCar, betAmount } = req.body;
                if (!raceId || !selectedCar || !betAmount) {
                        return res.status(400).json({ error: 'Missing required fields' });
                }
                let userId = req.user._id;
                let race, newBet;
                let car1Id, car2Id, car3Id, betOn, existingBet;
                if (selectedCar == "car1") {
                        existingBet = await Bet.findOne({ userId, raceId, car1Id: carId });
                        car1Id = carId; car2Id = null; car3Id = null; betOn = "I";
                } else if (selectedCar == "car2") {
                        existingBet = await Bet.findOne({ userId, raceId, car2Id: carId });
                        car2Id = carId; car1Id = null; car3Id = null; betOn = "II";
                } else {
                        existingBet = await Bet.findOne({ userId, raceId, car3Id: carId });
                        car3Id = carId; car2Id = null; car1Id = null; betOn = "III";
                }
                console.log(existingBet);
                if (!existingBet) {
                        const obj = { userId, raceId, car1Id: car1Id, car2Id: car2Id, car3Id: car3Id, betAmount, betOn: betOn, };
                        newBet = new Bet(obj);
                        await newBet.save();
                        race = await Race.findOneAndUpdate(
                                { _id: raceId, status: 'pending' },
                                {
                                        $inc: {
                                                noOfuser: 1,
                                                betsAmount: betAmount,
                                                [`${selectedCar}BetAmount`]: betAmount,
                                        },
                                },
                                { new: true }
                        );
                } else {
                        let previousBetAmount = betAmount - existingBet.betAmount;
                        existingBet.betAmount = betAmount;
                        await existingBet.save();
                        let findRace = await Race.findOne({ _id: raceId, },);
                        if (selectedCar == "car1") {
                                race = await Race.findOneAndUpdate({ _id: raceId, }, { $set: { betsAmount: findRace.betsAmount + previousBetAmount, car1BetAmount: findRace.car1BetAmount + previousBetAmount, }, }, { new: true });
                        } else if (selectedCar == "car2") {
                                race = await Race.findOneAndUpdate({ _id: raceId, }, { $set: { betsAmount: findRace.betsAmount + previousBetAmount, car2BetAmount: findRace.car2BetAmount + previousBetAmount, }, }, { new: true });
                        } else {
                                race = await Race.findOneAndUpdate({ _id: raceId, }, { $set: { betsAmount: findRace.betsAmount + previousBetAmount, car3BetAmount: findRace.car3BetAmount + previousBetAmount, }, }, { new: true });
                        }
                }
                return res.status(200).json({
                        status: 200,
                        message: 'Bet added successfully',
                        data: { bet: existingBet || newBet, race },
                });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.getBet = async (req, res) => {
        try {
                let findSpeed = await Bet.find({ userId: req.user._id, raceId: req.params.raceId });
                if (findSpeed.length === 0) {
                        return res.status(404).send({ status: 404, message: "Bets not found", data: {} });
                }
                return res.status(200).send({ status: 200, message: "Bets found", data: findSpeed });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
        }
};
exports.thisWeek = async (req, res) => {
        try {
                const userId = req.user._id;
                const currentDate = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(currentDate.getDate() - 7);
                const result = await Bet.aggregate([
                        {
                                $match: {
                                        userId: userId,
                                        createdAt: {
                                                $gte: sevenDaysAgo,
                                                $lte: currentDate,
                                        },
                                        status: 'win',
                                },
                        },
                        {
                                $lookup: {
                                        from: 'users',
                                        localField: 'userId',
                                        foreignField: '_id',
                                        as: 'user',
                                },
                        },
                        {
                                $unwind: '$user', // Unwind the user array
                        },
                        {
                                $group: {
                                        _id: {
                                                year: { $year: '$createdAt' },
                                                month: { $month: '$createdAt' },
                                                day: { $dayOfMonth: '$createdAt' },
                                        },
                                        totalWinAmount: { $sum: '$winAmount' },
                                        user: { $first: '$user' }, // Use $first to keep only the first user document
                                },
                        },
                        {
                                $project: {
                                        _id: 0, // Exclude the _id field
                                        date: '$_id',
                                        totalWinAmount: 1,
                                        user: {
                                                image: '$user.image',
                                                firstName: '$user.firstName',
                                        },
                                },
                        },
                        {
                                $sort: { 'date.year': 1, 'date.month': 1, 'date.day': 1 },
                        },
                ]);

                return res.status(200).json({ status: 200, message: 'Bet successfully', data: result });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.lastWeek = async (req, res) => {
        try {
                const userId = req.user._id;
                const currentDate = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(currentDate.getDate() - 14);
                const result = await Bet.aggregate([
                        {
                                $match: {
                                        userId: userId,
                                        createdAt: {
                                                $gte: sevenDaysAgo,
                                                $lte: currentDate,
                                        },
                                        status: 'win',
                                },
                        },
                        {
                                $lookup: {
                                        from: 'users',
                                        localField: 'userId',
                                        foreignField: '_id',
                                        as: 'user',
                                },
                        },
                        {
                                $unwind: '$user', // Unwind the user array
                        },
                        {
                                $group: {
                                        _id: {
                                                year: { $year: '$createdAt' },
                                                month: { $month: '$createdAt' },
                                                day: { $dayOfMonth: '$createdAt' },
                                        },
                                        totalWinAmount: { $sum: '$winAmount' },
                                        user: { $first: '$user' }, // Use $first to keep only the first user document
                                },
                        },
                        {
                                $project: {
                                        _id: 0, // Exclude the _id field
                                        date: '$_id',
                                        totalWinAmount: 1,
                                        user: {
                                                image: '$user.image',
                                                firstName: '$user.firstName',
                                        },
                                },
                        },
                        {
                                $sort: { 'date.year': 1, 'date.month': 1, 'date.day': 1 },
                        },
                ]);

                return res.status(200).json({ status: 200, message: 'Bet successfully', data: result });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.updatewinningbet = async (req, res) => {
        try {
                const betId = req.body.betId;
                const newWinningAmount = req.body.newWinningAmount; // Assuming you pass the new winning amount in the request body
                const updatedBet = await Bet.findByIdAndUpdate(betId, { $set: { winAmount: newWinningAmount, status: "win" } }, { new: true });
                if (!updatedBet) {
                        return res.status(404).json({ status: 404, message: 'Bet not found' });
                }
                return res.status(200).json({ status: 200, message: 'Winning amount updated successfully', data: updatedBet });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.carwisewinningamountondate = async (req, res) => {
        try {
                const dateParam = req.params.date;
                const selectedDate = new Date(dateParam);
                if (isNaN(selectedDate.getTime())) {
                        return res.status(400).json({ status: 400, message: 'Invalid date format' });
                }
                const nextDate = new Date(selectedDate);
                nextDate.setDate(selectedDate.getDate() + 1);
                const result = await Bet.aggregate([
                        {
                                $match: {
                                        createdAt: {
                                                $gte: selectedDate,
                                                $lt: nextDate,
                                        },
                                        status: 'win',
                                },
                        },
                        {
                                $group: {
                                        _id: '$car2Id',
                                        totalWinners: { $addToSet: '$userId' },
                                        totalWinAmount: { $sum: '$winAmount' },
                                },
                        },
                        {
                                $lookup: {
                                        from: 'cars',
                                        localField: '_id',
                                        foreignField: '_id',
                                        as: 'carDetails',
                                },
                        },
                        {
                                $unwind: '$carDetails',
                        },
                        {
                                $project: {
                                        _id: 0,
                                        carId: '$_id',
                                        carName: '$carDetails.name',
                                        carImage: '$carDetails.image',
                                        totalWinners: { $size: '$totalWinners' },
                                        totalWinAmount: 1,
                                },
                        },
                ]);

                return res.status(200).json({ status: 200, message: 'Data retrieved successfully', data: result });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.carwisewinningamountondatebyToken = async (req, res) => {
        try {
                const dateParam = req.params.date;
                const selectedDate = new Date(dateParam);
                if (isNaN(selectedDate.getTime())) {
                        return res.status(400).json({ status: 400, message: 'Invalid date format' });
                }
                const userId = req.user._id;
                const nextDate = new Date(selectedDate);
                nextDate.setDate(selectedDate.getDate() + 1);
                const result = await Bet.aggregate([
                        {
                                $match: {
                                        userId: userId,
                                        createdAt: {
                                                $gte: selectedDate,
                                                $lt: nextDate,
                                        },
                                        status: 'win',
                                },
                        },
                        {
                                $group: {
                                        _id: '$car2Id',
                                        totalWinners: { $addToSet: '$userId' },
                                        totalWinAmount: { $sum: '$winAmount' },
                                },
                        },
                        {
                                $lookup: {
                                        from: 'cars',
                                        localField: '_id',
                                        foreignField: '_id',
                                        as: 'carDetails',
                                },
                        },
                        {
                                $unwind: '$carDetails',
                        },
                        {
                                $project: {
                                        _id: 0,
                                        carId: '$_id',
                                        carName: '$carDetails.name',
                                        carImage: '$carDetails.image',
                                        totalWinners: { $size: '$totalWinners' },
                                        totalWinAmount: 1,
                                },
                        },
                ]);

                return res.status(200).json({ status: 200, message: 'Data retrieved successfully', data: result });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.carondate = async (req, res) => {
        try {
                let carId = req.query.carId;
                let date = req.query.date;
                const carFields = ['car1Id', 'car2Id', 'car3Id'];
                const carQuery = carFields.reduce((acc, field) => {
                        acc.$or.push({ [field]: carId });
                        return acc;
                }, { $or: [], createdAt: { $gte: new Date(date + "T00:00:00.000Z"), $lte: new Date(date + "T23:59:59.999Z") }, status: "win" });
                const carQuery1 = carFields.reduce((acc, field) => {
                        acc.$or.push({ [field]: carId });
                        return acc;
                }, { $or: [], createdAt: { $gte: new Date(date + "T00:00:00.000Z"), $lte: new Date(date + "T23:59:59.999Z") } });
                const betStatistics = await Bet.find(carQuery).populate('userId', 'firstName image');
                const betStatistics1 = await Bet.find(carQuery1)
                const totalWinnerUsers = betStatistics.length;
                const totalWinningAmount = betStatistics.reduce((total, bet) => total + bet.winAmount, 0);
                const car = await Car.findById(carId);
                if (!car) {
                        return res.status(404).send({ status: 404, message: "car not found ", data: {}, });
                }
                const result = {
                        car: car,
                        totalUser: betStatistics1.length,
                        totalWinnerUsers,
                        totalWinningAmount,
                        betStatistics
                };

                res.json(result);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
        }
};

const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}