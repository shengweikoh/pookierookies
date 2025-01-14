import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../Components/Sidebar"; // Reusable Sidebar component
import AssignNewTaskPopUp from "./AssignNewTaskPopUp";
import "./Assign_Task.css"; // Custom styles for this component

const TasksDashboard = () => {
  const tasks = useMemo(
    () => [
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
    ],
    []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Filter tasks whenever filters or search query change
  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.task.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === "" || task.group === selectedGroup;
      const matchesPerson =
        selectedPerson === "" || task.personAssigned === selectedPerson;

      return matchesSearch && matchesGroup && matchesPerson;
    });
    setFilteredTasks(filtered);
  }, [searchQuery, selectedGroup, selectedPerson, tasks]);

  const handleAssignTask = (newTask) => {
    const updatedTasks = [
      ...tasks,
      {
        id: tasks.length + 1,
        task: newTask.taskName,
        group: newTask.group,
        personAssigned: newTask.personAssigned,
        status: "Incomplete",
        dueDate: newTask.dueDate,
      },
    ];
    setFilteredTasks(updatedTasks);
    setIsPopupOpen(false);
  };

  return (
    <div className="tasks-dashboard">
      <Sidebar />
      <main className="tasks-container">
        <header className="tasks-header">
          <h1 className="header-title">Tasks</h1>
          <div className="header-buttons">
            <button
              className="normal-button"
              onClick={() => setIsPopupOpen(true)}
            >
              Assign New Task
            </button>
            <button
              className="red-button"
              onClick={() =>
                console.log("Selected task IDs (for deletion):", filteredTasks)
              }
            >
              Delete Tasks
            </button>
          </div>
        </header>

        {/* Filters Section */}
        <div className="filters-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by task"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="dropdown"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">All Groups</option>
            {Array.from(new Set(tasks.map((task) => task.group)))
              .filter((group) => group)
              .map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
          </select>
          <select
            className="dropdown"
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
          >
            <option value="">All Persons</option>
            {Array.from(new Set(tasks.map((task) => task.personAssigned)))
              .filter((person) => person)
              .map((person, index) => (
                <option key={index} value={person}>
                  {person}
                </option>
              ))}
          </select>
        </div>

        <table className="tasks-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Task</th>
              <th>Group</th>
              <th>Person Assigned</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => (
              <tr key={task.id}>
                <td>{index + 1}</td>
                <td>{task.task}</td>
                <td>{task.group || "-"}</td>
                <td>{task.personAssigned}</td>
                <td
                  className={(() => {
                    switch (task.status) {
                      case "Complete":
                        return "complete";
                      case "In Progress":
                        return "in-progress";
                      case "Incomplete":
                      default:
                        return "incomplete";
                    }
                  })()}
                >
                  {task.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {isPopupOpen && (
        <AssignNewTaskPopUp
          onClose={() => setIsPopupOpen(false)}
          onSubmit={handleAssignTask}
        />
      )}
    </div>
  );
};

export default TasksDashboard;