import React, { useState } from "react";
import "./AssignNewTaskPopUp.css";

const AssignNewTaskPopUp = ({ onClose, onSubmit }) => {
  const [taskName, setTaskName] = useState("");
  const [group, setGroup] = useState("");
  const [personAssigned, setPersonAssigned] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName || !group || !personAssigned || !dueDate) {
      alert("All fields are required!");
      return;
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
            Group:
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
            />
          </label>
          <label>
            Person Assigned:
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
              className="button cancel-button"
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