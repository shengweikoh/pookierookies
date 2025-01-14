import React, { useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom"
import { FaSignOutAlt } from "react-icons/fa";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    auth.signOut()
      .then(() => {
        localStorage.removeItem("authToken");
        navigate("/")
        console.log("User logged out");
      })
      .catch((error) => {
        console.error("error signing in", error)
      })
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="logo">
        {!isCollapsed && <span><Link id="logo" to="/home">BookBuddy</Link></span>} {/* Header shifted right */}
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? "☰" : "×"} {/* Icon changes based on state */}
        </button>
      </div>
      {!isCollapsed && (
        <>
          <ul className="nav-list">
            {/* <li className="nav-item section-title"><Link to="/account" className="links">Account</Link></li> */}
            <Link to="/calendar" className="links"><li className="nav-item section-title">Calendar</li></Link>
            <li className="nav-item section-title" id="tools">Tools</li>
            <Link to="/tools/manage-people" className="links"><li className="nav-item2">Manage Contacts</li></Link>
            <Link to="/tools/assign-task" className="links"><li className="nav-item2">Manage Tasks</li></Link>
            <Link to="/tools/schedule-meeting" className="links"><li className="nav-item2">Manage Meetings</li></Link>
            <Link to="/tools/reminders" className="links"><li className="nav-item2">Send Reminders</li></Link>
            <Link to="/tools/generate-summary" className="links"><li className="nav-item2">Generate Summary</li></Link>
          </ul>
          <div className="logout-section">
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt className="logout-icon" /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;