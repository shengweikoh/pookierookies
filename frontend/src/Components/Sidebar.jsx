import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="logo">
        {!isCollapsed && <span>BookBuddy</span>} {/* Header shifted right */}
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? "☰" : "☰"} {/* Icon changes based on state */}
        </button>
      </div>
      {!isCollapsed && (
        <ul className="nav-list">
          <li className="nav-item section-title">Home</li>
          <li className="nav-item section-title">Account</li>
          <li className="nav-item section-title">Calendar</li>
          <li className="nav-item section-title">Tools</li>
          <li className="nav-item2">Manage People</li>
          <li className="nav-item2">Assign Task</li>
          <li className="nav-item2">Schedule Meeting</li>
          <li className="nav-item2">Generate Summary</li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;