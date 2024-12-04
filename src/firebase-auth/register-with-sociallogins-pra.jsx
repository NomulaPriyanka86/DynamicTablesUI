// 
import React, { useState } from 'react';
import { auth, googleProvider, facebookProvider, githubProvider, twitterProvider } from '../firebase-auth/firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaGoogle, FaFacebook, FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa';
import '../assets/RoleModal.css';

const SocialRegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('admin'); // Default role
    const [socialUser, setSocialUser] = useState(null); // To store the social user details
    const [isSocialLogin, setIsSocialLogin] = useState(false); // To track if it's a social login

    const saveUserToLocalStorage = (user) => {
        const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = [...existingUsers, user];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        if (!role) {
            toast.error("Please select a role.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user details to localStorage
            const newUser = { user_name: username, email, password, role };
            saveUserToLocalStorage(newUser);

            toast.success("Registration successful!");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error during registration:', error);
            toast.error("Registration failed. Please try again.");
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            const extractedUsername = user.email.split("@")[0];
            setSocialUser({ ...user, username: extractedUsername });
            setIsSocialLogin(true); // Set social login flag to true
            setEmail(user.email); // Set email automatically after social login
        } catch (error) {
            console.error('Error during social login:', error);
            toast.error("Social login failed. Please try again.");
        }
    };

    const handleSocialRegistration = () => {
        if (!role) {
            toast.error("Please select a role.");
            return;
        }

        // Save social user details to localStorage
        const newUser = { user_name: socialUser.username, email: socialUser.email, role };
        saveUserToLocalStorage(newUser);

        toast.success("Social registration successful!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    return (
        <div>
            <form onSubmit={handleRegister}>
                {!isSocialLogin ? (
                    <>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Username:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <h3>Social Login Successful!</h3>
                        <div>
                            <label>Role:</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="admin">Admin</option>
                                <option value="payee">Payee</option>
                                <option value="F-admin">F-Admin</option>
                            </select>
                        </div>
                    </div>
                )}
                {!isSocialLogin ? (
                    <div>
                        <label>Role:</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="admin">Admin</option>
                            <option value="payee">Payee</option>
                            <option value="F-admin">F-Admin</option>
                        </select>
                    </div>
                ) : null}
                <button type="submit" className="social-button email">
                    <FaEnvelope /> Register with Email
                </button>
            </form>

            <button className="social-button google" onClick={() => handleSocialLogin(googleProvider)}>
                <FaGoogle /> Register with Google
            </button>
            <button className="social-button facebook" onClick={() => handleSocialLogin(facebookProvider)}>
                <FaFacebook /> Register with Facebook
            </button>
            <button className="social-button github" onClick={() => handleSocialLogin(githubProvider)}>
                <FaGithub /> Register with GitHub
            </button>
            <button className="social-button twitter" onClick={() => handleSocialLogin(twitterProvider)}>
                <FaTwitter /> Register with Twitter
            </button>

            {isSocialLogin && (
                <button className="social-button" onClick={handleSocialRegistration}>
                    Submit Role for Social Login
                </button>
            )}

            <ToastContainer />
        </div>
    );
};

export default SocialRegisterForm;
