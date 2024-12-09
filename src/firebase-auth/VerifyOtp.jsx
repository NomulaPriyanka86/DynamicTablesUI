// VerifyOTP.jsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./VerifyOTP.module.css";

const VerifyOTP = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const location = useLocation();
    const { userId } = location.state || {}; // Accepts either mobile or email

    const handleChange = (value, index) => {
        if (!/\d/.test(value) && value !== "") return; // Allow only digits
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Automatically move to the next box if value is entered
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleVerifyOtp = () => {
        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
            alert("Please enter a valid 6-digit OTP.");
            return;
        }
        // Add OTP verification logic here
        alert(`OTP verified for: ${userId}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Verify OTP</h2>
                <p className={styles.info}>Enter the OTP sent to {userId}</p>
                <div className={styles.otpWrapper}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            className={styles.otpInput}
                        />
                    ))}
                </div>
                <button onClick={handleVerifyOtp} className={styles.button}>
                    Verify OTP
                </button>
            </div>
        </div>
    );
};

export default VerifyOTP;
