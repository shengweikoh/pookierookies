import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // Loading state while checking auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken(); // Get the user's token
        localStorage.setItem("authToken", token); // Store token in localStorage
        setIsAuthenticated(true); // Set authenticated state
      } else {
        localStorage.removeItem("authToken"); // Remove token if user is logged out
        setIsAuthenticated(false); // Set unauthenticated state
      }
      setLoading(false); // Mark loading as complete
    });

    return () => unsubscribe(); // Cleanup the auth state listener
  }, []);

  if (loading) {
    // Show a loading indicator while checking authentication
    return <div>Loading...</div>;
  }

  // Render the protected route if authenticated, otherwise redirect to login
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;