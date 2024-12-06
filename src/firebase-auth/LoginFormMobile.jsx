import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../firebase-auth/firebase"; // Import Firebase methods
import styles from "./LoginFormMobile.module.css"; // Assume custom styles

const LoginFormMobile = () => {
    const [userId, setUserId] = useState("");
    const navigate = useNavigate();

    // Initialize reCAPTCHA
    useEffect(() => {
        try {
            // Initialize reCAPTCHA verifier once when the component is mounted
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear(); // Clear previous reCAPTCHA if any
            }

            // Initialize reCAPTCHA verifier for phone number authentication
            window.recaptchaVerifier = new RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "invisible", // Make reCAPTCHA invisible
                    callback: (response) => {
                        console.log("reCAPTCHA solved", response);
                    },
                },
                auth
            );

            // Check if the reCAPTCHA is initialized successfully
            console.log("reCAPTCHA initialized successfully.");
        } catch (error) {
            console.error("Error initializing reCAPTCHA:", error);
        }
    }, []);

    // Handle OTP sending logic
    const handleSendOtp = () => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId); // Email validation regex
        const isMobile = /^\d{10}$/.test(userId); // Mobile number validation regex

        if (!isEmail && !isMobile) {
            alert("Please enter a valid mobile number or email address.");
            return;
        }

        // If it's a valid mobile number, proceed with OTP sending
        if (isMobile) {
            const phoneNumber = "+1" + userId; // Add the country code (+1 for US, modify as necessary)
            const appVerifier = window.recaptchaVerifier;

            // Check if reCAPTCHA is initialized
            if (!appVerifier) {
                console.error("reCAPTCHA verifier is not initialized.");
                alert("reCAPTCHA failed to initialize. Please try again.");
                return;
            }

            // Send OTP request
            signInWithPhoneNumber(auth, phoneNumber, appVerifier)
                .then((confirmationResult) => {
                    // OTP sent successfully, navigate to the next step (Verify OTP)
                    alert(`OTP sent to ${userId}`);
                    navigate("/verify-otp", { state: { confirmationResult, userId } });
                })
                .catch((error) => {
                    console.error("Error during phone authentication", error);
                    alert("Failed to send OTP. Please try again.");
                });
        } else {
            // Handle email authentication here if applicable (optional)
            alert("Email authentication is not yet supported.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>User ID</h2>
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

                {/* Invisible reCAPTCHA container */}
                <div id="recaptcha-container"></div>
            </div>
        </div>
    );
};

export default LoginFormMobile;
