import React from 'react';
import './LoginPage.css';
import googleLogo from "../../assets/google.png";

// authentication
import { auth, provider, db } from "../../firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        // Add your Google Sign-In logic here (e.g., Firebase Auth or Google API)
        // console.log('Google Login clicked');
        try {
            const result = await signInWithPopup(auth, provider);
            const email = result.user.email;

            // Check if email is authorized
            const q = query(
                collection(db, "authorisedEmails"),
                where("email", "==", email)
            );
            const querySnapshot = await getDocs(q);

            console.log("Query Object:", q);
            console.log("Query Snapshot:", querySnapshot);
            console.log(email)

            if (!querySnapshot.empty) {
                navigate("/home");
            } else {
                alert("You are not authorised to access this application.");
                auth.signOut();
            }
        } catch (error) {
            console.error("Error during sign-in: ", error);
            alert("Sign-in failed. Please try again.");
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
                    <button type="button" className="google-login-button" onClick={handleGoogleLogin}>
                        <img src={googleLogo} alt="Google Logo" />
                        Sign in with Google
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
