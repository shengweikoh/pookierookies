import React from 'react';
import './LandingPage.css'; // Import CSS for styling

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>Welcome to Your App</h1>
          <p>Your one-stop solution for managing tasks and scheduling meetings efficiently.</p>
          <div className="cta-buttons">
            <button className="btn primary-btn">Get Started</button>
            <button className="btn secondary-btn">Learn More</button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>Features</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h3>Task Management</h3>
            <p>Organize your tasks and stay on top of your deadlines.</p>
          </div>
          <div className="feature-item">
            <h3>Meeting Scheduling</h3>
            <p>Seamlessly schedule meetings with automatic calendar sync.</p>
          </div>
          <div className="feature-item">
            <h3>Reminders</h3>
            <p>Never miss a task or meeting with customizable reminders.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Your App Name. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;