const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String, // Hashed password
    otp: String,
    otpExpires: Date,
});

const User = mongoose.model("User", UserSchema);

// Email Transporter (Using App Password for Gmail)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER, // Your Gmail SMTP Email
        pass: process.env.SMTP_PASS, // App Password (Not your Gmail password)
    },
    tls: {
        rejectUnauthorized: false, // Allows SSL/TLS connection
    },
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register & Send OTP
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60000); // OTP valid for 5 mins

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "Email already registered." });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ name, email, password: hashedPassword, otp, otpExpires });
        await user.save();

        // Send OTP Email with better formatting
        await transporter.sendMail({
            from: `"Your App Name" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OTP Code - Secure Login",
            text: `Hello ${name},\n\nYour OTP is: ${otp}. It is valid for 5 minutes.\n\nIf you didn't request this, please ignore it.\n\nBest Regards,\nYour App Team`,
            html: `<p>Hello <strong>${name}</strong>,</p>
                   <p>Your OTP is: <strong>${otp}</strong></p>
                   <p><small>This OTP is valid for 5 minutes. If you didn't request this, please ignore this email.</small></p>
                   <p>Best Regards, <br>Your App Team</p>`,
            headers: {
                "X-Priority": "1", 
                "X-Mailer": "Nodemailer",
            },
        });

        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        // Clear OTP after verification
        user.otp = null;
        await user.save();

        res.json({ success: true, message: "OTP verified successfully!" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Email not registered." });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password." });
        }

        res.json({ success: true, message: "Login successful!" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
