import * as React from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import styles from "./Login.module.css";

export function Login() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  let from = location.state?.from?.pathname || "/";

  async function handleSubmit(event) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let username = formData.get("username");

    // Make API call to verify if the user exists
    try {
      const response = await fetch("http://localhost:8080/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response:", response.status, errorText);
        alert("Login failed. Please check your credentials and try again.");
        return;
      }

      const data = await response.json();
      console.log("Server Response:", data); // Log server response

      if (data.success) {
        // Mock user object based on the response (using username here as an example)
        const user = { username }; // You can modify this as needed
        console.log("Signing in with user:", user); // Log user data

        auth.signin(user, () => {
          navigate("/verifyOtp", { replace: true });
        });
      } else {
        alert(data.message || "Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      alert("An error occurred while connecting to the server. Please try again.");
    }
  }


  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <p>You must log in to view the page at {from}</p>

        <form onSubmit={handleSubmit}>
          <label className={styles.title}>
            Username: <input name="username" type="text" className={styles.input} />
          </label>{" "}
          <button type="submit" className={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
}
