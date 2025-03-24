import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(""); // Reset error message on each login attempt

        try {
            const response = await axios.post("http://127.0.0.1:5000/login", formData);
            console.log("Login Response:", response.data);

            if (response.data.success) {
                setLoading(false);
                // Redirect to dashboard if login is successful
                navigate("/dashboard"); // Redirect to the dashboard page
            } else {
                setErrorMessage(response.data.message || "❌ Login failed!"); // Display server error message
                setLoading(false);
            }
        } catch (error) {
            // Handle errors
            setErrorMessage(error.response?.data?.error || "❌ Something went wrong! Try again.");
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-4 rounded shadow-lg w-25">
                <h2 className="text-center">Login</h2>

                {/* Error Messages */}
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <form onSubmit={handleLogin}>
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
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
