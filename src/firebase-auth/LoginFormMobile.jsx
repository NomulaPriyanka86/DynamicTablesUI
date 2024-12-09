// MobileLoginForm.jsx
import React, { useState } from "react";
import styles from "./LoginFormMobile.module.css";
import { useNavigate } from "react-router-dom";

const LoginFormMobile = () => {
    const [userId, setUserId] = useState("");
    const navigate = useNavigate();

    const handleSendOtp = () => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId); // Regex for email validation
        const isMobile = /^\d{10}$/.test(userId); // Regex for 10-digit mobile number

        if (!isEmail && !isMobile) {
            alert("Please enter a valid mobile number or email address.");
            return;
        }
        // Add OTP sending logic here
        alert(`OTP sent to ${userId}`);
        // Redirect to VerifyOTP component with the user ID
        navigate("/verifyOtp", { state: { userId } });
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>User Id</h2>
                <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter mobile number or email ID"
                    className={styles.input}
                />
                <button onClick={handleSendOtp} className={styles.button}>
                    Send OTP
                </button>
            </div>
        </div>
    );
};

export default LoginFormMobile;
