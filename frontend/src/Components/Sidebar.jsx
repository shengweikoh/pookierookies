import React from "react";
// import "../pages/home/Home.css";
import "./Sidebar.css";
import { Link } from "react-router-dom"

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo"><Link id="logo" to="/home">BookBuddy</Link></div>
      <ul className="nav-list">
        {/* <li className="nav-item section-title"></li> */}
        <li className="nav-item section-title"><Link to="/account" className="links">Account</Link></li>
        <li className="nav-item section-title"><Link to="/calendar" className="links">Calendar</Link></li>
        <li className="nav-item section-title" id="tools">Tools</li>
        <li className="nav-item2"><Link to="/tools/manage-people" className="links">Manage People</Link></li>
        <li className="nav-item2"><Link to="/tools/assign-task" className="links">Assign Task</Link></li>
        <li className="nav-item2"><Link to="/tools/schedule-meeting" className="links">Schedule Meeting</Link></li>
        <li className="nav-item2"><Link to="/tools/generate-summary" className="links">Generate Summary</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;