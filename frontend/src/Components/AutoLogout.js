import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

const AutoLogout = ({ children }) => {
  const navigate = useNavigate();

  

  useEffect(() => {
    const handleAutoLogout = () => {
        auth.signOut()
          .then(() => {
            localStorage.removeItem("authToken");
            alert("You have been logged out due to inactivity")
            navigate("/"); // Redirect to login
          })
          .catch((error) => {
            console.error("Error signing out:", error);
          });
      };

    const logoutTimeLimit = 60 * 60 * 1000; // 1 hour in milliseconds
    // const logoutTimeLimit = 10 * 1000 //for testing
    let logoutTimer;

    const resetTimer = () => {
      const currentTime = Date.now();
      localStorage.setItem("lastActivity", currentTime); // Update last activity time
      clearTimeout(logoutTimer); // Reset timer
      logoutTimer = setTimeout(() => {
        const lastActivity = parseInt(localStorage.getItem("lastActivity") || 0);
        if (Date.now() - lastActivity >= logoutTimeLimit) {
          handleAutoLogout(); // Log out user
        }
      }, logoutTimeLimit);
    };

    // Add event listeners for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Initialize activity tracking
    resetTimer();

    return () => {
      clearTimeout(logoutTimer); // Clear timer on unmount
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [navigate]);

  return children;
};

export default AutoLogout;
