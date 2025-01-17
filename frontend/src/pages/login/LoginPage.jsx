import React, { useState } from 'react';
import './LoginPage.css';
import googleLogo from "../../assets/google.png";

// Firebase imports
import { auth, provider } from "../../firebase/firebase";
import { signInWithPopup } from "firebase/auth";
// import { collection, query, where, getDocs } from "firebase/firestore";

// Axios for backend requests
import axios from "axios";

// React Router for navigation
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(""); // State to track error messages
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setErrorMessage(""); // Clear any previous error messages
        setLoading(true);
    
        // Open a placeholder page immediately
        const placeholderWindow = window.open("", "_blank");
    
        try {
            // Google Sign-In using Firebase Auth
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
            // Get the ID token for backend verification
            const idToken = await user.getIdToken();
            console.log("Token:", idToken);
            console.log(user.email);
    
            // Send the token to the backend for verification   
            const backendResponse = await axios.post(
                `${process.env.REACT_APP_BACKEND_BASE_URL}auth/verify-token/`,
                { token: idToken },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            console.log("Backend Response:", backendResponse.data);
    
            // Call the verify_google_token endpoint
            const verifyGoogleTokenResponse = await axios.post(
                `${process.env.REACT_APP_BACKEND_BASE_URL}auth/verify-google-token/`,
                { email: user.email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            console.log("Verify-Google-Token Response:", verifyGoogleTokenResponse.data.auth_url);
    
            // Redirect the placeholder window to the actual auth_url
            if (verifyGoogleTokenResponse.data.auth_url) {
                placeholderWindow.location.href = verifyGoogleTokenResponse.data.auth_url;
            } else {
                console.error("Redirect URL not provided in response");
                placeholderWindow.close(); // Close the placeholder if no URL is provided
                setErrorMessage("Unable to proceed. Please try again later.");
            }
    
            navigate("/home");
    
        } catch (error) {
            console.error("Error during sign-in:", error.response?.data || error.message);
            setErrorMessage("Sign-in failed. Please try again.");
    
            // Close the placeholder window in case of an error
            if (placeholderWindow) {
                placeholderWindow.close();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="signin-header">
                    <h2>BookBuddy</h2>
                    <p>Your Personal Assistant for Easy Scheduling</p>
                </div>
                {/* <form className="signin-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">SIGN IN</button>
        </form> */}
                <form className="signin-form">
                    {/* <input type="email" placeholder="Email" required />
                    <input type="password" placeholder="Password" required /> */}
                    <button
                        type="button"
                        className="google-login-button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <img src={googleLogo} alt="Google Logo" />
                        {loading ? "Signing in..." : "Sign in with Google"}
                    </button>

                    {errorMessage && (
                        <div className="error-message">
                            {errorMessage}
                        </div>
                    )}

                    {loading && (
                        <div className="loading-indicator">
                            Loading...
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

