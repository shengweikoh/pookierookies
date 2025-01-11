import React from "react";
import "./Home.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">BookBuddy</div>
      <ul className="nav-list">
        <li className="nav-item section-title">Account</li>
        <li className="nav-item section-title">Calendar</li>
        <li className="nav-item section-title">Tools</li>
        <li className="nav-item2">Manage People</li>
        <li className="nav-item2">Assign Task</li>
        <li className="nav-item2">Schedule Meeting</li>
        <li className="nav-item2">Generate Summary</li>
      </ul>
    </div>
  );
};

export default Sidebar;