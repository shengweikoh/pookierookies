import React, { useState } from "react";
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
    const [dueDate, setDueDate] = useState(task.dueDate);

    const handleSave = async () => {
        const updatedFields = {};
    
        // Add only fields that have been edited
        if (taskName !== task.name) updatedFields.name = taskName;
        if (taskDetails !== task.description) updatedFields.description = taskDetails;
        if (group !== task.group) updatedFields.group = group;
        if (status !== task.status) updatedFields.status = status;
        if (priority !== task.priority) updatedFields.priority = priority;
        if (dueDate !== task.dueDate) updatedFields.dueDate = dueDate;
    
        try {
          // Axios PATCH request to update task
          const response = await axios.put(
            `${process.env.REACT_APP_BACKEND_BASE_URL}tasks/${profileId}/${task.taskId}/`, // Adjust endpoint as needed
            updatedFields,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
    
          console.log("Task successfully updated:", response.data);
          alert("Task successfully updated!");
          onSave(response.data); // Pass the updated task back to parent
          onClose(); // Close the popup
        } catch (err) {
          console.error("Error updating task:", err);
          alert("Failed to update task. Please try again later.");
        }
      };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Edit Task</h2>
                <form onSave={handleSave}>
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
                            value={priority}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Incomplete">Incomplete</option>
                            <option value="In Progress">In Progress</option>
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
                        <button onClick={handleSave} className="button">Save</button>
                        <button onClick={onClose} className="cancel-button button">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskPopUp;