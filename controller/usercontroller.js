const jwt = require("jsonwebtoken");
const randomatic = require("randomatic");
const User = require("../model/userModel");
const Car = require("../model/car");
const Track = require("../model/track");
const Speed = require("../model/speed");
const Race = require("../model/race");
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
                        return res.status(200).send({ status: 200, message: "OTP generated and sent to the user.", data: user, });
                } else {
                        const otp = randomatic("0", 4);
                        user.otp = otp;
                        user.isVerified = false;
                        await user.save();
                        return res.status(200).send({ status: 200, message: "OTP generated and sent to the user.", data: user, });
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
                let findOne = await Race.findOne({ pending: 'pending' }).populate([
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

const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}