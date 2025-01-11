import React from 'react';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h2>Welcome Back!</h2>
          <p>Enter your personal details to use all of the site features</p>
        </div>
        <form className="signin-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">SIGN IN</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
