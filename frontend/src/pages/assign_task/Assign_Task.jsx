import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar"; // Reusable Sidebar component
import "./Assign_Task.css"; // Custom styles for this component

const TasksDashboard = () => {
    const tasks = [
        {
            id: 1,
            task: "Plan budget for Bookfest",
            group: "Finance Dept",
            personAssigned: "John Doe",
            status: "Incomplete",
        },
        {
            id: 2,
            task: "Make poster",
            group: "Publicity for Bookfest",
            personAssigned: "Mary Smith",
            status: "Complete",
        },
        {
            id: 3,
            task: "Send summary email to stakeholders",
            group: "",
            personAssigned: "Jane Cooper",
            status: "Complete",
        },
        {
            id: 4,
            task: "Identify blockers and plan solutions",
            group: "",
            personAssigned: "Sam Tan",
            status: "In Progress",
        },
    ];

    const [selectedTasks, setSelectedTasks] = useState([]);

    const handleTaskSelection = (taskId) => {
        setSelectedTasks((prev) =>
            prev.includes(taskId)
                ? prev.filter((id) => id !== taskId) // Deselect if already selected
                : [...prev, taskId] // Select if not already selected
        );
    };

    // Handle "Select All" checkbox
    const handleSelectAll = (isChecked) => {
        setSelectedTasks(isChecked ? tasks.map((task) => task.id) : []);
    };

    return (
        <div className="tasks-dashboard">
            <Sidebar />
            <main className="tasks-container">
                <header className="tasks-header">
                    <h1 className="header-title">Tasks</h1>
                    <div className="filters">
                        <input
                            type="text"
                            placeholder="Search by person"
                            className="search-bar"
                        />
                        <select className="dropdown">
                            <option value="">Group</option>
                            <option value="finance">Finance Dept</option>
                            <option value="publicity">Publicity for Bookfest</option>
                        </select>
                        <button className="normal-button">Assign New Task</button>
                        <button className="red-button" onClick={() =>
                            console.log("Selected task IDs:", selectedTasks)
                        }>
                            {/* change the onclick logic to delete selectedTasks when backend is done */}
                            Delete Tasks
                        </button>
                    </div>
                </header>

                <table className="tasks-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    checked={selectedTasks.length === tasks.length}
                                />
                            </th>
                            <th>S/N</th>
                            <th>Task</th>
                            <th>Group</th>
                            <th>Person Assigned</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, index) => (
                            <tr key={task.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedTasks.includes(task.id)}
                                        onChange={() => handleTaskSelection(task.id)}
                                    />
                                </td>
                                <td>{index + 1}</td>
                                <td>{task.task}</td>
                                <td>{task.group || "-"}</td>
                                <td>{task.personAssigned}</td>
                                <td className={(() => {
                                    switch (task.status) {
                                        case "Complete":
                                            return "complete";
                                        case "In Progress":
                                            return "in-progress";
                                        case "Incomplete":
                                        default:
                                            return "incomplete";
                                    }
                                })()}>
                                    {task.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default TasksDashboard;
