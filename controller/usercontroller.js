const jwt = require("jsonwebtoken");
const randomatic = require("randomatic");
const User = require("../model/userModel");
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
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}