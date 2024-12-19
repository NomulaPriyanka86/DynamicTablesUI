import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";
import styles from "./Login.module.css";

export function VerifyOTP() {
    const [otp, setOtp] = useState("");  // OTP state
    const [error, setError] = useState(null);  // Error state
    const navigate = useNavigate();  // Navigation hook from react-router
    const { verifyOtp, user } = useAuth();  // Use verifyOtp from context

    // Handle OTP input change
    const handleOTPChange = (event) => {
        setOtp(event.target.value);
    };
    // Handle OTP submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!otp) {  // Check if OTP is entered
            setError("Please enter the OTP.");
            return;
        }

        const mobileNumber = "9676000000";  // Hardcoded mobile number for testing

        try {
            // Call your backend API to verify OTP
            const response = await fetch("http://localhost:8080/api/v1/verifyOtp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ otp, mobileNumber }),  // Pass OTP and mobile number
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // OTP verified successfully
                // Use the context method to set OTP verified state
                verifyOtp(otp, (success) => {
                    if (success) {
                        // Navigate to dynamic page if OTP verified
                        const pageTitle = "player_new";  // You can make this dynamic if needed
                        navigate(`/dynamic-table/${pageTitle}`, { replace: true });
                        // navigate(`/`, { replace: true });
                    } else {
                        setError("Error verifying OTP. Please try again.");
                    }
                });
            } else {
                // Show error message if OTP verification fails
                setError(data.message || "Invalid OTP. Please try again.");
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setError("An error occurred. Please try again later.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2>Verify OTP</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>
                            <input
                                type="text"
                                value={otp}
                                onChange={handleOTPChange}
                                placeholder="Enter your OTP"
                                className={styles.input}
                            />
                        </label>
                    </div>
                    {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error messages */}
                    <button type="submit" className={styles.button} >
                        Submit OTP
                    </button>
                </form>
            </div>
        </div>
    );
}
