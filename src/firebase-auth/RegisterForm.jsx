// import React, { useState } from 'react';
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
// import { FaEnvelope } from 'react-icons/fa';
// import { auth } from '../firebase';

// const RegisterForm = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [username, setUsername] = useState('');
//     const [role, setRole] = useState('');
//     const [mobileNumber, setMobileNumber] = useState(''); // Added state for mobile number

//     const handleRegister = async (event) => {
//         event.preventDefault();

//         if (!role) {
//             toast.error("Please select a role.");
//             return;
//         }

//         try {
//             // Firebase user registration
//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;

//             // Save user details in the database
//             await axios.post("http://localhost:8080/api/auth/register", {
//                 user_name: username,
//                 email: email,
//                 password: password,
//                 role: role,
//                 mobile_number: mobileNumber, // Include mobile number
//             });

//             toast.success("Registration successful!");
//             setTimeout(() => {
//                 window.location.reload();
//             }, 2000);
//         } catch (error) {
//             console.error('Error during registration:', error);
//             toast.error("Registration failed. Please try again.");
//         }
//     };

//     return (
//         <div>
//             <form onSubmit={handleRegister}>
//                 <div>
//                     <label>Email:</label>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Password:</label>
//                     <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Username:</label>
//                     <input
//                         type="text"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Role:</label>
//                     <select
//                         value={role}
//                         onChange={(e) => setRole(e.target.value)}
//                         required
//                     >
//                         <option value="">Select Role</option>
//                         <option value="admin">Admin</option>
//                         <option value="payee">Payee</option>
//                         <option value="F-admin">F-Admin</option>
//                     </select>
//                 </div>
//                 <div>
//                     <label>Mobile Number:</label>
//                     <input
//                         type="tel"
//                         value={mobileNumber}
//                         onChange={(e) => setMobileNumber(e.target.value)}
//                         pattern="[0-9]{10,15}"
//                         required
//                     />
//                 </div>
//                 <button type="submit" className="social-button email">
//                     <FaEnvelope /> Register with Email
//                 </button>
//             </form>

//             <ToastContainer />
//         </div>
//     );
// };

// export default RegisterForm;


import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope } from 'react-icons/fa';
import { auth } from './firebase';
import styles from "./loginStyles.module.css";

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');

    const handleRegister = async (event) => {
        event.preventDefault();

        if (!role) {
            toast.error("Please select a role.");
            return;
        }

        try {
            // Firebase user registration
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user details to local storage
            const usersData = JSON.parse(localStorage.getItem('users')) || [];
            const newUser = {
                user_name: username,
                email: email,
                password: password, // Ideally, never store plain passwords
                role: role,
                mobile_number: mobileNumber,
                uid: user.uid, // Store Firebase user UID
            };
            localStorage.setItem('users', JSON.stringify([...usersData, newUser]));

            toast.success("Registration successful!");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error during registration:', error);
            toast.error("Registration failed. Please try again.");
        }
    };

    return (
        <div>
            <form onSubmit={handleRegister} className={styles.customForm}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        className={styles.customInput}
                        required
                    />
                </div>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                <div>
                    <label>Mobile Number:</label>
                    <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className={styles.customInput}
                        pattern="[0-9]{10,15}"
                        required
                    />
                </div>
                <button type="submit" className={`${styles.socialButton} ${styles.email}`}>
                    <FaEnvelope /> Register with Email
                </button>
            </form>

            <ToastContainer />
        </div>
    );
};

export default RegisterForm;
