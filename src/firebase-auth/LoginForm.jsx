import React, { useState } from "react";
import {
    auth,
    googleProvider,
    facebookProvider,
    githubProvider,
    twitterProvider,
} from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaGoogle, FaFacebook, FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";
// import './loginStyles.css';
import { useNavigate } from 'react-router-dom';
import styles from "./loginStyles.module.css";
const LoginForm = ({ title }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();  // Initialize navigate function

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!role) {
            toast.error("Please select a role.");
            return;
        }

        try {
            // Firebase email-password login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // localStorage.setItem('loggedInUserUid', user.uid);
            sessionStorage.setItem('loggedInUserUid', user.uid);  // Store user UID in session storage

            // Retrieve user data from localStorage
            const usersData = JSON.parse(localStorage.getItem("users")) || [];
            const existingUser = usersData.find(
                (u) => u.email === user.email && u.mobile_number === mobile && u.role === role
            );

            if (existingUser) {
                toast.success("Login successful!");
                setTimeout(() => {
                    navigate(`/pageSchemas`); // Redirect to the table page
                }, 2000);
            } else {
                toast.error("Role mismatch or user not found.");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            toast.error("Login failed");
        }
    };

    const handleSocialLogin = async (provider) => {
        if (!role) {
            toast.error("Please select a role.");
            return;
        }

        try {
            // Firebase social login
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            // localStorage.setItem('loggedInUserUid', user.uid);
            sessionStorage.setItem('loggedInUserUid', user.uid);  // Store user UID in session storage


            // Check or add social login details in localStorage
            const usersData = JSON.parse(localStorage.getItem("users")) || [];
            const existingUser = usersData.find((u) => u.email === user.email);

            if (!existingUser) {
                const newUser = {
                    email: user.email,
                    role,
                    user_name: "social-login-user",
                };
                localStorage.setItem("users", JSON.stringify([...usersData, newUser]));
            }

            toast.success("Social login successful!");
            setTimeout(() => {
                navigate("/dynamic-table/${title}"); // Redirect to the table page
            }, 2000);
        } catch (error) {
            console.error("Error with social login:", error);
            toast.error("Social login failed.");
        }
    };

    return (
        <div >
            <form onSubmit={handleLogin} className={styles.customForm}>
                <div >
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email"
                        className={styles.customInput}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className={styles.customInput}
                        required
                    />
                </div>
                <div>
                    <label>Mobile:</label>
                    <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter Mobile"
                        className={styles.customInput}
                        required
                    />
                </div>
                <div>
                    <label>Role:</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={styles.customSelect}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="payee">Payee</option>
                        <option value="F-admin">F-Admin</option>
                    </select>
                </div>
                <button type="submit" className={`${styles.socialButton} ${styles.email}`}>
                    <FaEnvelope className={styles.icon} /> Login with Email
                </button>
            </form>
            <div className={styles.socialLoginIcons}>
                {/* Google Icon */}
                <FaGoogle
                    className={`${styles.socialIcon} ${styles.google}`}
                    onClick={() => handleSocialLogin(googleProvider)}
                    title="Login with Google"
                />

                {/* Facebook Icon */}
                <FaFacebook
                    className={`${styles.socialIcon} ${styles.facebook}`}
                    onClick={() => handleSocialLogin(facebookProvider)}
                    title="Login with Facebook"
                />

                {/* GitHub Icon */}
                <FaGithub
                    className={`${styles.socialIcon} ${styles.github}`}
                    onClick={() => handleSocialLogin(githubProvider)}
                    title="Login with GitHub"
                />

                {/* Twitter Icon */}
                <FaTwitter
                    className={`${styles.socialIcon} ${styles.twitter}`}
                    onClick={() => handleSocialLogin(twitterProvider)}
                    title="Login with Twitter"
                />
            </div>
            <ToastContainer />
        </div>
    );
};

export default LoginForm;

