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

    const handleGoogleLogin = async () => {
        setErrorMessage(""); // Clear any previous error messages
        try {
            // Google Sign-In using Firebase Auth
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // // Check if the email is authorized
            // const email = user.email;
            // const q = query(
            //     collection(db, "authorisedEmails"),
            //     where("email", "==", email)
            // );
            // const querySnapshot = await getDocs(q);

            // console.log("Query Object:", q);
            // console.log("Query Snapshot:", querySnapshot);
            // console.log("Email:", email);

            // if (querySnapshot.empty) {
            //     // If email is not authorized, show an alert and sign the user out
            //     setErrorMessage("You are not authorized to access this application.");
            //     auth.signOut();
            //     return;
            // }

            // Get the ID token for backend verification
            const idToken = await user.getIdToken();
            console.log("Token:", idToken);
            console.log(user.email)

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

            navigate("/home");

        } catch (error) {
            console.error("Error during sign-in:", error.response?.data || error.message);
            setErrorMessage("Sign-in failed. Please try again."); // Display error
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
                    >
                        <img src={googleLogo} alt="Google Logo" />
                        Sign in with Google
                    </button>

                    {errorMessage && (
                        <div className="error-message">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

