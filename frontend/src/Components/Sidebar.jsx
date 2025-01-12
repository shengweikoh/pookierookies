import React, { useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom"

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="logo">
        {!isCollapsed && <span><Link id="logo" to="/home">BookBuddy</Link></span>} {/* Header shifted right */}
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? "☰" : "☰"} {/* Icon changes based on state */}
        </button>
      </div>
      {!isCollapsed && (
        <ul className="nav-list">
          <li className="nav-item section-title"><Link to="/account" className="links">Account</Link></li>
          <li className="nav-item section-title"><Link to="/calendar" className="links">Calendar</Link></li>
          <li className="nav-item section-title" id="tools">Tools</li>
          <li className="nav-item2"><Link to="/tools/manage-people" className="links">Manage People</Link></li>
          <li className="nav-item2"><Link to="/tools/assign-task" className="links">Assign Task</Link></li>
          <li className="nav-item2"><Link to="/tools/schedule-meeting" className="links">Manage Meetings</Link></li>
          <li className="nav-item2"><Link to="/tools/generate-summary" className="links">Generate Summary</Link></li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;