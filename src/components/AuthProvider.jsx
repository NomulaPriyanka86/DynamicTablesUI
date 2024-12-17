import * as React from "react";
import { Navigate, useLocation } from "react-router";
import { fakeAuthProvider } from "./auth";

const SESSION_DURATION = 0.3 * 60 * 1000; // 0.5 minute in milliseconds

let AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [isSessionExpired, setIsSessionExpired] = React.useState(false);

  // **1. Check session data on initial load**
  React.useEffect(() => {
    const storedSession = localStorage.getItem("userSession");
    if (storedSession) {
      const { user: storedUser, expiry } = JSON.parse(storedSession);
      const currentTime = new Date().getTime();

      if (currentTime < expiry) {
        setUser(storedUser);
        setOtpVerified(true);
        setIsSessionExpired(false);
      } else {
        localStorage.removeItem("userSession");
        setIsSessionExpired(true);
      }
    }
  }, []);

  // **2. Session expiration check every second**
  React.useEffect(() => {
    const sessionInterval = setInterval(() => {
      const storedSession = localStorage.getItem("userSession");
      if (storedSession) {
        const { expiry } = JSON.parse(storedSession);
        const currentTime = new Date().getTime();
        if (currentTime >= expiry) {
          console.log("Session expired, clearing localStorage");
          localStorage.removeItem("userSession");
          setUser(null);
          setOtpVerified(false);
          setIsSessionExpired(true);
        }
      }
    }, 1000);

    return () => clearInterval(sessionInterval);
  }, []);

  // **3. Sign in function**
  const signin = (newUser, callback) => {
    return fakeAuthProvider.signin(() => {
      // const now = new Date();
      // const expiry = now.getTime() + SESSION_DURATION;

      setUser(newUser);
      setOtpVerified(false); // Reset OTP verification
      setIsSessionExpired(false);

      // localStorage.setItem(
      //   "userSession",
      //   JSON.stringify({
      //     user: newUser,
      //     expiry,
      //     loggedInAt: now.toISOString(),
      //   })
      // );

      callback();
    });
  };

  // **4. Verify OTP function**
  const verifyOtp = (otp, callback) => {
    return fakeAuthProvider.verifyOtp(otp, (success) => {
      if (success) {
        const now = new Date();
        const expiry = now.getTime() + SESSION_DURATION;

        setOtpVerified(true);
        setIsSessionExpired(false); // Reset session expiry state
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            user,
            expiry,
            loggedInAt: now.toISOString(),
          })
        );

        callback(true);
      } else {
        callback(false);
      }
    });
  };

  // **5. Sign out function**
  const signout = (callback) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      setOtpVerified(false);
      localStorage.removeItem("userSession");
      setIsSessionExpired(true);
      callback();
    });
  };

  const value = {
    user,
    otpVerified,
    signin,
    verifyOtp,
    signout,
    isSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  // **Redirect to login page if session expired or user is not authenticated**
  if (!auth.user || auth.isSessionExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // **Redirect to verify OTP page if OTP is not verified**
  if (!auth.otpVerified && location.pathname !== "/verifyOtp") {
    return <Navigate to="/verifyOtp" state={{ from: location }} replace />;
  }

  return children;
}
