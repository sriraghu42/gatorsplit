import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useHistory } from "react-router-dom";
const swal = require("sweetalert2");

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwtDecode(localStorage.getItem("authTokens"))
      : null
  );
  // const [user, setUser] = useState(() => {
  //   try {
  //     // ✅ Ensure authTokens is a **string** before decoding
  //     return authTokens && typeof authTokens === "string" ? jwtDecode(authTokens) : null;
  //   } catch (error) {
  //     console.error("Invalid token format:", error.message);
  //     return null;
  //   }
  // });

  const [loading, setLoading] = useState(true);

  const history = useHistory();
  const registerUser = async (username, email, password) => {
    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
  
      if (response.ok) {
        swal.fire({
          title: "Success",
          text: "Account created successfully! Please log in.",
          icon: "success",
          toast: true,
          timer: 2000,
          position: "top-right",
          timerProgressBar: true,
          showConfirmButton: false,
          showCloseButton: true,
        });
        return true;
      } else {
        const data = await response.json();
        throw new Error(data.error || "Registration failed.");
      }
    } catch (error) {
      swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        toast: true,
        timer: 2000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton: true,
      });
      return false;
    }
  };
  const loginUser = async (username, password) => {
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        if (typeof data.token !== "string") {
          throw new Error("Received token is not a string");
        }

        // ✅ Ensure token is stored as a string
        localStorage.setItem("authTokens", JSON.stringify(data.token));
        setAuthTokens(data.token);
        setUser(jwtDecode(data.token));
        history.push("/dashboard");

        swal.fire({
          title: "Login Successful",
          icon: "success",
          toast: true,
          timer: 2000,
          position: "top-right",
          timerProgressBar: true,
          showConfirmButton: false,
          showCloseButton: true,
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        toast: true,
        timer: 2000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton: true,
      });
    }
  };

  // ✅ Handle logout
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    history.push("/login");

    swal.fire({
      title: "Logged Out",
      icon: "success",
      toast: true,
      timer: 2000,
      position: "top-right",
      timerProgressBar: true,
      showConfirmButton: false,
      showCloseButton: true,
    });
  };

  // ✅ Ensure token is valid before decoding
  const isTokenExpired = () => {
    if (!authTokens) return true;
    try {
      const decoded = jwtDecode(authTokens);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      console.error("Invalid token format:", error.message);
      return true;
    }
  };


  // Send OTP
  const sendOTP = async (email,parmtext) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/send-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email ,parmtext}),
      });

      const data = await response.json();
      if (response.ok) {
        swal.fire({
          title: "OTP Sent",
          text: "An OTP has been sent to your email.",
          icon: "success",
          toast: true,
          timer: 2000,
          position: "top-right",
          timerProgressBar: true,
          showConfirmButton: false,
          showCloseButton:true
        });
        return true;
      } else {
        throw new Error(data.error || "Failed to send OTP.");
      }
    } catch (error) {
      swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        toast: true,
        timer: 2000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton:true
      });
      return false;
    }
  };

  // Verify OTP
  const verifyOTP = async (email, otp) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
  
      const data = await response.json();
      console.log("OTP Verification Response:", data); // Debugging log
      if (response.ok) {
        swal.fire({
          title: "OTP Verified",
          icon: "success",
          toast: true,
          timer: 2000,
          position: "top-right",
          timerProgressBar: true,
          showConfirmButton: false,
          showCloseButton:true
        });
        return true;
      } else {
        throw new Error(data.error || "Invalid OTP.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error.message);
      swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        toast: true,
        timer: 2000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton:true
      });
      return false;
    }
  };
  // Reset Password
const resetPassword = async (email, newPassword) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/reset-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, new_password: newPassword }),
    });

    const data = await response.json();
    if (response.ok) {
      swal.fire({
        title: "Password Reset Successful",
        text: "You can now login with your new password.",
        icon: "success",
        toast: true,
        timer: 2000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton:true
      });
      return true;
    } else {
      throw new Error(data.error || "Failed to reset password.");
    }
  } catch (error) {
    swal.fire({
      title: "Error",
      text: error.message,
      icon: "error",
      toast: true,
      timer: 2000,
      position: "top-right",
      timerProgressBar: true,
      showConfirmButton: false,
      showCloseButton:true
    });
    return false;
  }
};
const verifyOldPassword = async (email, oldPassword) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/verify-old-password/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, oldPassword }),
    });

    if (!response.ok) {
      throw new Error("Invalid email or old password");
    }

    return true;
  } catch (error) {
    console.error("Error verifying old password:", error);
    return false;
  }
};


  // Run Check on Component Load
  useEffect(() => {
    let storedToken = localStorage.getItem("authTokens");
  
    // ✅ Ensure the token is a valid string and not wrapped in JSON
    if (storedToken) {
      try {
        storedToken = JSON.parse(storedToken); // If stored as JSON, parse it
        if (typeof storedToken !== "string") throw new Error("Token is not a valid string");
      } catch (error) {
        console.error("🚨 Invalid token format in localStorage:", error.message);
        localStorage.removeItem("authTokens"); // Clear invalid token
        storedToken = null;
      }
    }
  
    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        console.warn("🔴 Token expired. Logging out...");
        logoutUser();
      } else {
        try {
          setUser(jwtDecode(storedToken)); // ✅ Decode safely
          console.log("✅ Token decoded successfully:", jwtDecode(storedToken));
        } catch (error) {
          console.error("🚨 Error decoding token:", error.message);
          logoutUser();
        }
      }
    }
  }, []);


  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    registerUser,
    loginUser,
    logoutUser,
    sendOTP,
    verifyOTP,
    resetPassword,
    verifyOldPassword,


  };

  useEffect(() => {
    if (authTokens) {
      setUser(jwtDecode(authTokens));
    
    }
    setLoading(false);
  }, [authTokens]);

  return (
    <AuthContext.Provider value={contextData}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};
