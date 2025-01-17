import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./AssignNewTaskPopUp.css";

const AssignNewTaskPopUp = ({ onClose, onSubmit }) => {
  const [taskName, setTaskName] = useState("");
  const [taskDetails, setTaskDetails] = useState("");
  const [priority, setPriority] = useState("Low");
  const [group, setGroup] = useState("");
  const [personAssigned, setPersonAssigned] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!taskName || !taskDetails || !group || !personAssigned || !dueDate) {
        setError("All fields are required.");
        return;
      }

      if (!validateEmail(personAssigned)) {
        setError("Invalid email address.");
        return;
      }

      setError(""); // Clear any previous error

      const data = {
        name: taskName,
        description: taskDetails,
        status: "Incomplete", // Default status
        priority, // User-selected priority
        group,
        dueDate: new Date(dueDate).toISOString(), // ISO format date
        assignedBy: localStorage.getItem("userEmail"), // Get logged-in user
        assignedTo: personAssigned,
      };

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}tasks/create/`,
          data,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Task successfully created:", response.data);
        onSubmit(response.data); // Notify parent of the new task
        onClose(); // Close the popup
      } catch (err) {
        console.error("Error creating task:", err);
        setError("Failed to assign task. Please try again later.");
      }
    }, [taskName, taskDetails, group, personAssigned, dueDate, priority, onSubmit, onClose]
  );

  useEffect(() => {
    // Lock body scroll when the popup is open
    document.body.style.overflow = "hidden";

    // Event listener for keyboard events
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose(); // Close the popup on Escape key
      } else if (e.key === "Enter") {
        handleSubmit(e); // Submit the form on Enter key
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function to unlock body scroll and remove event listener
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, handleSubmit]); // Dependency array ensures proper cleanup

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);


  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Assign New Task</h2>
        <div className="popup-scrollable-content">
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>
              Task Name:
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
              />
            </label>
            <label>
              Task Details:
              <textarea
                value={taskDetails}
                onChange={(e) => setTaskDetails(e.target.value)}
                rows="3"
                required
              />
            </label>
            <label>
              Priority:
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label>
              Group:
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
              />
            </label>
            <label>
              Person Assigned (Email):
              <input
                type="email"
                value={personAssigned}
                onChange={(e) => setPersonAssigned(e.target.value)}
                required
              />
            </label>
            <label>
              Due Date:
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </label>
            <div className="popup-buttons">
              <button type="submit" className="button">
                Assign
              </button>
              <button
                type="button"
                className="cancel-button button"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignNewTaskPopUp;