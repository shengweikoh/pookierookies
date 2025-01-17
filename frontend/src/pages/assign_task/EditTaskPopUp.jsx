import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./EditTaskPopUp.css";
import { getLoggedInUserId } from "../../Components/utils";

const profileId = getLoggedInUserId();

const EditTaskPopUp = ({ task, onClose, onSave }) => {
    const [taskName, setTaskName] = useState(task.name);
    const [group, setGroup] = useState(task.group || "");
    const [status, setStatus] = useState(task.status);
    const [taskDetails, setTaskDetails] = useState(task.description);
    const [priority, setPriority] = useState(task.priority);
    const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split("T")[0] : "");

    const handleSave = useCallback(async () => {
        const updatedTask = {};
      
        // Add only fields that have been edited
        if (taskName !== task.name) updatedTask.name = taskName;
        if (taskDetails !== task.description) updatedTask.description = taskDetails;
        if (group !== task.group) updatedTask.group = group;
        if (status !== task.status) updatedTask.status = status;
        if (priority !== task.priority) updatedTask.priority = priority;
        if (dueDate !== task.dueDate.split("T")[0]) {
            updatedTask.dueDate = new Date(dueDate).toISOString();
        }
      
        try {
            // Axios PUT request to update task
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_BASE_URL}tasks/${profileId}/${task.taskId}/edit/`,
                updatedTask,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
      
            console.log("Task successfully updated:", response.data);
            alert("Task successfully updated!");
      
            // Pass the updated task to the parent
            onSave(response.data); // This should trigger the parent state update
            onClose(); // Close the popup
        } catch (err) {
            console.error("Error updating task:", err);
            alert("Failed to update task. Please try again later.");
        }
      }, [task, taskName, dueDate, group, priority, taskDetails, status, onSave, onClose]);
      

    useEffect(() => {
        // Lock body scroll when the popup is open
        document.body.style.overflow = "hidden";

        // Event listener for keyboard events
        const handleKeyDown = (e) => {
          if (e.key === "Escape") {
            onClose(); // Close the popup on Escape key
          } else if (e.key === "Enter") {
            handleSave(); // Submit the form on Enter key
          }
        };

        document.addEventListener("keydown", handleKeyDown);

        // Cleanup function to unlock body scroll and remove event listener
        return () => {
          document.body.style.overflow = "auto";
          document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, handleSave]);

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Edit Task</h2>
                <div className="popup-scrollable-content">
                    <form onSubmit={handleSave}>
                        <label>
                            Task Name:
                            <input
                                type="text"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                            />
                        </label>
                        <label>
                            Task Details:
                            <input
                                type="text"
                                value={taskDetails}
                                onChange={(e) => setTaskDetails(e.target.value)}
                            />
                        </label>
                        <label>
                            Priority:
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </label>
                        <label>
                            Status:
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Incomplete">Incomplete</option>
                                <option value="Pending">Pending</option>
                                <option value="Complete">Complete</option>
                            </select>
                        </label>
                        <label>
                            Group:
                            <input
                                type="text"
                                value={group}
                                onChange={(e) => setGroup(e.target.value)}
                            />
                        </label>
                        <label>
                            Due Date:
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </label>
                        <div className="popup-buttons">
                            <button type="button" onClick={handleSave} className="button">Save</button>
                            <button type="button" onClick={onClose} className="cancel-button button">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTaskPopUp;
