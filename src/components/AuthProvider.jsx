import * as React from "react";
import { Navigate, useLocation } from "react-router";
import { fakeAuthProvider } from "./auth";  // Assuming you have a fakeAuthProvider for testing

const SESSION_DURATION = 0.3 * 60 * 1000; // 0.5 minute in milliseconds

let AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [loginTime, setLoginTime] = React.useState(null);
  const [isSessionExpired, setIsSessionExpired] = React.useState(false); // Track session expiration state

  React.useEffect(() => {
    const sessionInterval = setInterval(() => {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        const { expiry } = JSON.parse(storedSession);
        const currentTime = new Date().getTime();
        if (currentTime >= expiry) {
          console.log('Session expired, clearing localStorage');
          localStorage.removeItem('userSession');
          setIsSessionExpired(true); // Mark session as expired
        }
      }
    }, 1000); // Check every second

    // Clean up interval on component unmount
    return () => clearInterval(sessionInterval);
  }, []);

  const signin = (newUser, callback) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      // const now = new Date();
      // setLoginTime(now);

      // // Set the expiry time for the session
      // const expiry = now.getTime() + SESSION_DURATION;
      // console.log(`Setting session with expiry: ${expiry}`);
      // localStorage.setItem('userSession', JSON.stringify({
      //   user: newUser,
      //   expiry,
      //   loggedInAt: now.toISOString()
      // }));
      callback();
    });
  };

  const signout = (callback) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      setOtpVerified(false);
      setLoginTime(null);
      console.log('Signing out and clearing session');
      localStorage.removeItem('userSession');
      setIsSessionExpired(true); // Mark session as expired when signing out
      callback();
    });
  };

  const verifyOtp = (otp, callback) => {
    return fakeAuthProvider.verifyOtp(otp, (success) => {
      if (success) {
        const newUser = { name: "User" }; // Set appropriate user data here
        const now = new Date();
        setUser(newUser);
        setOtpVerified(true);
        setLoginTime(now);

        // Store session with expiry and login time
        const expiry = now.getTime() + SESSION_DURATION;
        console.log(`Setting session with expiry: ${expiry}`);
        localStorage.setItem('userSession', JSON.stringify({
          user: newUser,
          expiry,
          loggedInAt: now.toISOString()
        }));
      }
      callback(success);
    });
  };

  const value = { user, otpVerified, loginTime, signin, signout, verifyOtp, isSessionExpired };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
// export function RequireAuth({ children }) {
//   let auth = useAuth();
//   let location = useLocation();

//   // First, check if the session has expired
//   if (auth.isSessionExpired || !auth.user) {
//     // If session expired or user is not authenticated, redirect to login page
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // If OTP is not verified, redirect to /verifyOtp
//   if (!auth.otpVerified && location.pathname !== "/verifyOtp") {
//     console.log("Redirecting to /verifyOtp");
//     return <Navigate to="/verifyOtp" state={{ from: location }} replace />;
//   }

//   // Return the children if no redirection is necessary
//   return children;
// }


export function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  // Check session state in localStorage if user and otpVerified are null
  React.useEffect(() => {
    if (!auth.user || !auth.otpVerified) {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        const { user, expiry, otpVerified } = JSON.parse(storedSession);
        const currentTime = new Date().getTime();
        if (currentTime < expiry && otpVerified) {
          auth.signin(user, () => {
            auth.verifyOtp("", () => { });
          });
        }
      }
    }
  }, [auth]);

  if (auth.isSessionExpired || !auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!auth.otpVerified && location.pathname !== "/verifyOtp") {
    return <Navigate to="/verifyOtp" state={{ from: location }} replace />;
  }

  return children;
}

