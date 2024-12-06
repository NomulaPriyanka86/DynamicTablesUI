import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"; // Add necessary Firebase auth functions

const firebaseConfig = {
  apiKey: "AIzaSyAAcSZzQGjzQ8O-5D7EX0iKRvK7cJrIv-o",
  authDomain: "fir-login-38d08.firebaseapp.com",
  projectId: "fir-login-38d08",
  storageBucket: "fir-login-38d08.firebasestorage.app",
  messagingSenderId: "187749339275",
  appId: "1:187749339275:web:5c0d87f9ad283c5b2a448e",
  measurementId: "G-MDZ09HNXHW",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };