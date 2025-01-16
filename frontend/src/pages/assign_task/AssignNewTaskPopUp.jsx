import React, { useState } from "react";
import axios from "axios";
import "./AssignNewTaskPopUp.css";

const AssignNewTaskPopUp = ({ onClose, onSubmit }) => {
  const [taskName, setTaskName] = useState("");
  const [taskDetails, setTaskDetails] = useState("");
  const [priority, setPriority] = useState("Low");
  const [group, setGroup] = useState("");
  const [personAssigned, setPersonAssigned] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName || !taskDetails || !group || !personAssigned || !dueDate) {
      alert("All fields are required!");
      return;
    }

    const data = {
      name: taskName,
      description: taskDetails,
      status: "Incomplete", // Default status
      priority, // User-selected priority
      group,
      dueDate: new Date(dueDate).toISOString(), // Convert date to ISO format
      assignedBy: localStorage.getItem("userEmail"), // Logged-in user
      assignedTo: personAssigned,
    };
    try {
      // Axios POST request to backend API
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}tasks/create/`, 
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Task successfully created:", response.data);
      alert("Task successfully assigned!");
      onSubmit(response.data); // Pass response data back to parent if needed
      setTaskName("");
      setTaskDetails("");
      setPriority("Low");
      setGroup("");
      setPersonAssigned("");
      setDueDate("");
      onClose(); // Close the popup
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to assign task. Please try again later.");
    }
    onSubmit({ taskName, group, personAssigned, dueDate });
    setTaskName("");
    setGroup("");
    setPersonAssigned("");
    setDueDate("");
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Assign New Task</h2>
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
            <input
              type="text"
              value={taskDetails}
              onChange={(e) => setTaskDetails(e.target.value)}
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
              type="text"
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
  );
};

export default AssignNewTaskPopUp;