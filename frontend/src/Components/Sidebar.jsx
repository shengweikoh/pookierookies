import React, { useState } from "react";
// import { ToastContainer, toast } from "react-toastify";
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
        localStorage.removeItem("userEmail");
        // toast.success("You have been logged out successfully!", {
        //   position: toast.POSITION.TOP_RIGHT,
        // }); // Show success toast
        alert("You have been logged out successfully.")
        navigate("/")
        // toast.success("You have been logged out successfully.");
        console.log("User logged out");
      })
      .catch((error) => {
        // toast.error("Error signing out. Please try again.");
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
            {/* <li className="nav-item section-title" id="tools">Tools</li> */}
            <Link to="/manage-people" className="links"><li className="nav-item section-title">Manage Contacts</li></Link>
            <Link to="/assign-task" className="links"><li className="nav-item section-title">Assign Tasks</li></Link>
            <Link to="/schedule-meeting" className="links"><li className="nav-item section-title">Manage Meetings</li></Link>
            <Link to="/generate-summary" className="links"><li className="nav-item section-title">Generate Summary</li></Link>
          </ul>
          <div className="logout-section">
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt className="logout-icon" /> Logout
            </button>
            {/* <ToastContainer />  */}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;