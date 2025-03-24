const mongoose = require("mongoose");

const AuthenticationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, required: false },
    otpExpires: { type: Date, required: false },
});

const Authentication = mongoose.model("Authentication", AuthenticationSchema);
module.exports = Authentication;
