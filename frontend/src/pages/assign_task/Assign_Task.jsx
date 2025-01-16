import React, { useState, useEffect } from "react";
// import { useMemo } from "react";
import axios from "axios";
import Sidebar from "../../Components/Sidebar"; // Reusable Sidebar component
import AssignNewTaskPopUp from "./AssignNewTaskPopUp";
import EditTaskPopUp from "./EditTaskPopUp";
import SendReminderPopUp from "./SendReminderPopUp";
import "./Assign_Task.css"; // Custom styles for this component
import { getLoggedInUserId } from "../../Components/utils";

const TasksDashboard = () => {
  // const tasks = useMemo(
  //   () => [
  //     {
  //       "name": "New Task",
  //       "group": "Group A",
  //       "dueDate": "2025-01-20T12:00:00",
  //       "description": "This is a new task",
  //       "userId": "zJjVj3VT6gaoUXmeSI8kgtm6zRy1",
  //       "creationDate": "2025-01-12T10:02:50.716101",
  //       "taskId": "04350fed-5006-499c-9622-8e70c393fcee",
  //       "status": "Incomplete",
  //       "priority:": "Low"
  //     }, {
  //       id: 1,
  //       task: "Plan budget for Bookfest",
  //       group: "Finance Dept",
  //       personAssigned: "John Doe",
  //       status: "Incomplete",
  //     },
  //     {
  //       id: 2,
  //       task: "Make poster",
  //       group: "Publicity for Bookfest",
  //       personAssigned: "Mary Smith",
  //       status: "Complete",
  //     },
  //     {
  //       id: 3,
  //       task: "Send summary email to stakeholders",
  //       group: "",
  //       personAssigned: "Jane Cooper",
  //       status: "Complete",
  //     },
  //     {
  //       id: 4,
  //       task: "Identify blockers and plan solutions",
  //       group: "",
  //       personAssigned: "Sam Tan",
  //       status: "In Progress",
  //     },
  //   ],
  //   []
  // );

  const profileId = getLoggedInUserId();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null)

  // Fetch tasks from backend
  // need to edit the username attribute
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}tasks/${profileId}/assignedBy/`);
        setTasks(response.data.tasks); // Assume API returns an array of tasks
        setFilteredTasks(response.data.tasks); // Initially, all tasks are shown
        // setLoading(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        // setError("Failed to fetch tasks. Please try again later.");
        // setLoading(false);
      }
    };

    fetchTasks();
  }, [profileId]);

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

  const handleTaskSelection = (id) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((taskId) => taskId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSendReminders = () => {
    if (selectedTasks.length > 0) {
      setIsReminderPopupOpen(true);
    } else {
      alert("Please select at least one task to send reminders.");
    }
  };

  const handleDeleteSelectedTasks = async () => {
    // edit this with the variable memberId using nested axios call or change the api
    for (const taskId of selectedTasks) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_BACKEND_BASE_URL}tasks/${profileId}/${taskId}/delete/`);
        console.log(`Successfully deleted task with ID ${taskId}:`, response.data);
      } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error.response?.data || error.message);
      }
    }

    const remainingTasks = tasks.filter((task) => !selectedTasks.includes(task.taskId));
    setFilteredTasks(remainingTasks);
    setSelectedTasks([]);
    console.log("Deleted tasks with IDs:", selectedTasks);
  };

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

  const handleEditTask = (task) => {
    setTaskToEdit(task); // Set the task to edit
    setIsEditPopupOpen(true); // Open the pop-up
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false); // Close the pop-up
    setTaskToEdit(null); // Clear the task being edited
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
              onClick={handleSendReminders}
            >
              Send Reminders
            </button>
            <button
              className="normal-button"
              onClick={() => setIsPopupOpen(true)}
            >
              Add New Task
            </button>
            <button
              className="red-button"
              onClick={handleDeleteSelectedTasks}
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
            {Array.from(new Set(tasks.map((task) => task.assignedTo)))
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
              <th>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedTasks(
                      e.target.checked ? filteredTasks.map((task) => task.taskId) : []
                    )
                  }
                  checked={
                    selectedTasks.length === filteredTasks.length &&
                    filteredTasks.length > 0
                  }
                />
              </th>
              <th>S/N</th>
              <th>Task</th>
              <th>Group</th>
              <th>Person Assigned</th>
              <th>Progress</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => (
              <tr key={task.taskId}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.taskId)}
                    onChange={() => handleTaskSelection(task.taskId)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>{task.name}</td>
                <td>{task.group || "-"}</td>
                <td>{task.assignedTo}</td>
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
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEditTask(task.taskId)}
                  >
                    Edit
                  </button>
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

      {isReminderPopupOpen && (
        <SendReminderPopUp
          onClose={() => setIsReminderPopupOpen(false)}
          selectedTasks={selectedTasks}
        />
      )}

      {isEditPopupOpen && (
        <EditTaskPopUp
          task={taskToEdit}
          onClose={closeEditPopup}
          onSave={(updatedTask) => {
            console.log("Updated Task:", updatedTask);
            closeEditPopup();
          }}
        />
      )}

    </div>
  );
};

export default TasksDashboard;