import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUsers,
  FaTasks,
  FaBriefcase,
  FaFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";
import { auth } from "../firebase/firebase";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");
        alert("You have been logged out successfully.");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="logo">
        {!isCollapsed && (
          <span>
            <Link id="logo" to="/home">
              BookBuddy
            </Link>
          </span>
        )}
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? "☰" : "×"}
        </button>
      </div>
      <ul className="nav-list">
        <Link to="/calendar" className="links">
          <li className="nav-item section-title">
            <FaCalendarAlt className="nav-icon" />
            <span className={`nav-text ${isCollapsed ? "hidden" : ""}`}>
              Calendar
            </span>
          </li>
        </Link>
        <Link to="/manage-people" className="links">
          <li className="nav-item section-title">
            <FaUsers className="nav-icon" />
            <span className={`nav-text ${isCollapsed ? "hidden" : ""}`}>
              Manage Contacts
            </span>
          </li>
        </Link>
        <Link to="/assign-task" className="links">
          <li className="nav-item section-title">
            <FaTasks className="nav-icon" />
            <span className={`nav-text ${isCollapsed ? "hidden" : ""}`}>
              Assign Tasks
            </span>
          </li>
        </Link>
        <Link to="/schedule-meeting" className="links">
          <li className="nav-item section-title">
            <FaBriefcase className="nav-icon" />
            <span className={`nav-text ${isCollapsed ? "hidden" : ""}`}>
              Manage Meetings
            </span>
          </li>
        </Link>
        <Link to="/generate-summary" className="links">
          <li className="nav-item section-title">
            <FaFileAlt className="nav-icon" />
            <span className={`nav-text ${isCollapsed ? "hidden" : ""}`}>
              Generate Summary
            </span>
          </li>
        </Link>
      </ul>
      <div className="logout-section">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          {!isCollapsed && <span className="logout-text">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;