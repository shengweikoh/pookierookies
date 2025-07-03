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

    // ✅ Open popup immediately — critical for Safari
    let result;
    try {
        result = await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Google sign-in popup blocked or failed:", error);
        setErrorMessage("Popup blocked or sign-in failed. Please try again.");
        return;
    }

    // ✅ Only do async work *after* popup interaction is complete
    setLoading(true);

    const user = result.user;

    try {
        const idToken = await user.getIdToken();

        const backendResponse = await axios.post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}auth/verify-token/`,
            { token: idToken },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const verifyGoogleTokenResponse = await axios.post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}auth/verify-google-token/`,
            { email: user.email },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const authUrl = verifyGoogleTokenResponse.data.auth_url;

        if (authUrl) {
            // ✅ Use redirect instead of opening new window if you prefer
            window.location.href = authUrl;
        } else {
            console.error("Redirect URL not provided in response");
            setErrorMessage("Unable to proceed. Please try again later.");
        }

    } catch (error) {
        console.error("Error during backend auth:", error.response?.data || error.message);
        setErrorMessage("Sign-in failed. Please try again.");
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

