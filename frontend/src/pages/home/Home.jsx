import React from "react";
import Sidebar from "./Sidebar";
import TaskList from "./TaskDashboard";
import "./Home.css";

const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

const Home = () => {
  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <div className="welcome-section">
          <h1>Task Dashboard</h1>
          <div className="date">{currentDate}</div>
        </div>
        <TaskList />
      </div>
    </div>
  );
};

export default Home;