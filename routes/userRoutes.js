const express = require("express");
const auth = require("../controller/usercontroller");
const router = express.Router();
const authJwt = require("../middleware/authJwt");
module.exports = (app) => {
        app.post("/api/v1/user/login", auth.loginUser);
        app.post("/api/v1/user/socialLogin", auth.socialLogin);
        app.post("/api/v1/user/verify/otp", auth.verifyOtplogin);
        app.get("/api/v1/user/me", authJwt.verifyToken, auth.getUserDetails)
        app.put("/api/v1/user/me", authJwt.verifyToken, auth.updateUserDetails)
        app.post("/api/v1/user/createRace", authJwt.verifyToken, auth.createRace)
}