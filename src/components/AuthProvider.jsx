import * as React from "react";
import { Navigate, useLocation } from "react-router";
import { fakeAuthProvider } from "./auth";  // Assuming you have a fakeAuthProvider for testing

let AuthContext = React.createContext();

export function AuthProvider({ children }) {
  let [user, setUser] = React.useState(null);
  let [otpVerified, setOtpVerified] = React.useState(false);

  let signin = (newUser, callback) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      callback();
    });
  };

  let signout = (callback) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      setOtpVerified(false);
      callback();
    });
  };

  // Verify OTP and set the user if successful
  let verifyOtp = (otp, callback) => {
    return fakeAuthProvider.verifyOtp(otp, (success) => {
      if (success) {
        // OTP is verified, set user data
        setUser({ name: "User" });  // Set appropriate user data here
        setOtpVerified(true);
      }
      callback(success);
    });
  };

  let value = { user, otpVerified, signin, signout, verifyOtp };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export function RequireAuth({ children }) {
  let auth = useAuth();
  let location = useLocation();
  if (!auth.user || !auth.otpVerified) {
    // Redirect to login if there's no user
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // if (auth.user && !auth.otpVerified) {
  //   // Redirect to OTP verification if user exists but OTP is not verified
  //   return <Navigate to="/verifyOtp" state={{ from: location }} replace />;
  // }
  // Redirect to login if the user tries to access verifyOtp directly without being authenticated
  if (!auth.user && location.pathname === "/verifyOtp") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// export function RequireOtpVerification({ children }) {
//   let auth = useAuth();
//   let location = useLocation();

//   if (!auth.user) {
//     // Redirect to login if there's no user
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (auth.user && auth.otpVerified) {
//     // Redirect to home or dashboard if OTP is already verified
//     return <Navigate to="/" state={{ from: location }} replace />;
//   }

//   return children;
// }

