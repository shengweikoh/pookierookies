import React from "react";
import Sidebar from "../../Components/Sidebar"
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
          <h1>My Tasks</h1>
          <div className="date">{currentDate}</div>
        </div>
        <TaskList />
      </div>
    </div>
  );
};

export default Home;