import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../Components/Sidebar";
import AssignNewTaskPopUp from "./AssignNewTaskPopUp";
import EditTaskPopUp from "./EditTaskPopUp";
import SendReminderPopUp from "./SendReminderPopUp";
import "./Assign_Task.css";
import { getLoggedInUserId } from "../../Components/utils";

const TasksDashboard = () => {
  const profileId = getLoggedInUserId();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Sidebar collapse state

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}tasks/${profileId}/assignedBy/`
        );
        setTasks(response.data.tasks || []);
        setFilteredTasks(response.data.tasks || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [profileId]);

  // Filter tasks based on search, group, and person
  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        (task.name && task.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGroup = !selectedGroup || task.group === selectedGroup;
      const matchesPerson = !selectedPerson || task.assignedTo === selectedPerson;

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

  const handleDeleteSelectedTasks = async () => {
    for (const taskId of selectedTasks) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_BASE_URL}tasks/${profileId}/${taskId}/delete/`
        );
        console.log(`Successfully deleted task with ID ${taskId}`);
      } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error.message);
      }
    }

    const remainingTasks = tasks.filter((task) => !selectedTasks.includes(task.taskId));
    setTasks(remainingTasks);
    setFilteredTasks(remainingTasks);
    setSelectedTasks([]);
  };

  const handleRemindThisTask = async (task) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}tasks/${profileId}/${task.taskId}/reminder/`
      );
      console.log(`Successfully sent reminder for task with ID ${task.taskId}`);
    } catch (error) {
      console.error(`Error sending reminder for task with ID ${task.taskId}:`, error.message);
    }
  }

  const handleAssignTask = (newTask) => {
    const updatedTasks = [
      ...tasks,
      {
        ...newTask,
        status: "Incomplete",
      },
    ];
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    setIsPopupOpen(false);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsEditPopupOpen(true);
  };

  const handleSaveEditedTask = (updatedTask) => {
    // Update the task in the tasks state
    const updatedTaskList = tasks.map((t) =>
      t.taskId === updatedTask.taskId ? updatedTask : t
    );

    // Update both tasks and filteredTasks immediately
    setTasks(updatedTaskList);
    setFilteredTasks(updatedTaskList);  // Ensure filtered tasks update as well
    closeEditPopup();
  };

  const handleSendReminders = () => {
    if (selectedTasks.length > 0) {
      setIsReminderPopupOpen(true);
    } else {
      alert("Please select at least one task to send reminders.");
    }
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
    setTaskToEdit(null);
  };

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        {loading ? (
          <div className="loading-container">
            <p>Loading tasks...</p>
          </div>
        ) : (
          <>
            <header className="tasks-header">
              <h1 className="header-title">Tasks</h1>
              <div className="header-buttons">
                <button className="normal-button" onClick={() => setIsPopupOpen(true)}>
                  Add New Task
                </button>
                <button className="normal-button" onClick={handleSendReminders}>
                  Send Reminders
                </button>
                <button className="red-button" onClick={handleDeleteSelectedTasks}>
                  Delete Tasks
                </button>
              </div>
            </header>

            <div className="filters-container">
              <input
                type="text"
                className="search-bar"
                placeholder="Search tasks"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="dropdown"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">All Groups</option>
                {Array.from(new Set(tasks.map((task) => task.group))).map((group, index) => (
                  <option key={index} value={group}>
                    {group || "No Group"}
                  </option>
                ))}
              </select>
              <select
                className="dropdown"
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
              >
                <option value="">All Persons</option>
                {Array.from(new Set(tasks.map((task) => task.assignedTo))).map((person, index) => (
                  <option key={index} value={person}>
                    {person || "Unassigned"}
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
                        selectedTasks.length === filteredTasks.length && filteredTasks.length > 0
                      }
                    />
                  </th>
                  <th>S/N</th>
                  <th>Task</th>
                  <th>Group</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th colSpan={2} className="actions">Actions</th>
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
                    <td>{task.assignedTo || "Unassigned"}</td>
                    <td className={task.status.toLowerCase()}>{task.status}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEditTask(task)}>
                        Edit
                      </button>
                    </td>
                    <td>
                      <button className="remind-button" onClick={() => handleRemindThisTask(task)}>
                        Remind
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

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

      {isEditPopupOpen && taskToEdit && (
        <EditTaskPopUp
          task={taskToEdit}
          onClose={closeEditPopup}
          onSave={handleSaveEditedTask}  // Pass the handler here
        />
      )}
    </div>
  );
};

export default TasksDashboard;