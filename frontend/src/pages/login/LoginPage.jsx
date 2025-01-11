import React from 'react';
import './LoginPage.css';
import googleLogo from "../../assets/google.png"; // Adjust path as necessary


const LoginPage = () => {
    const handleGoogleLogin = () => {
        // Add your Google Sign-In logic here (e.g., Firebase Auth or Google API)
        console.log('Google Login clicked');
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
                    <input type="email" placeholder="Email" required />
                    <input type="password" placeholder="Password" required />
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
