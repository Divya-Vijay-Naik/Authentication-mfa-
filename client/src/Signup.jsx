import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle registration & OTP request
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await axios.post("http://127.0.0.1:5000/register", formData);
            console.log("Registration Response:", response.data); // Debugging

            if (response.data.success) {
                setSuccessMessage("✅ OTP sent to your email!");
                setShowOtpInput(true); // Show OTP input field after successful registration
            } else {
                setErrorMessage(response.data.message || "❌ Registration failed!");
            }
        } catch (error) {
            console.error("Error:", error.response?.data);
            setErrorMessage(error.response?.data?.error || "❌ Something went wrong! Try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP verification
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await axios.post("http://127.0.0.1:5000/verify-otp", {
                email: formData.email,
                otp,
            });

            if (response.data.success) {
                setSuccessMessage("✅ OTP verified successfully!");
                navigate("/login"); // Redirect to login page after success
            } else {
                setErrorMessage(response.data.message || "❌ OTP verification failed!");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.error || "❌ Something went wrong! Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-4 rounded w-25 shadow">
                <h2 className="text-center">{showOtpInput ? "Enter OTP" : "Register"}</h2>

                {/* Error & Success Messages */}
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                {!showOtpInput ? (
                    // Registration Form
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            className="form-control mb-2"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="form-control mb-2"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="form-control mb-2"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button type="submit" className="btn btn-success w-100" disabled={loading}>
                            {loading ? "Processing..." : "Get OTP"}
                        </button>
                    </form>
                ) : (
                    // OTP Verification Form
                    <form onSubmit={handleOtpSubmit}>
                        <input
                            type="number"
                            placeholder="Enter OTP"
                            className="form-control mb-2"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}

                <p className="mt-3 text-center">Already have an account?</p>
                <Link to="/login" className="btn btn-default border w-100 bg-light">
                    Login
                </Link>
            </div>
        </div>
    );
}

export default Signup;
