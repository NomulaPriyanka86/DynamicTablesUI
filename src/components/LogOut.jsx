import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider"; // Import the AuthProvider hook

function LogOut() {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signout(() => {
            navigate("/login", { replace: true }); // Redirect to the login page
        });
    };

    return (
        <button onClick={handleLogout} style={logoutButtonStyles}>
            Logout
        </button>
    );
}

const logoutButtonStyles = {
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
};

export default LogOut;
