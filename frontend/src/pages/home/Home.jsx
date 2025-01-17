import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../Components/Sidebar";
import "./Home.css";
import { getLoggedInUserId } from "../../Components/utils";

const HomePage = () => {
  const profileId = getLoggedInUserId();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [taskPage, setTaskPage] = useState(0); // For pagination
  const [meetingPage, setMeetingPage] = useState(0); // For pagination
  const itemsPerPage = 3; // Number of items to show at a time

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}tasks/${profileId}/assignedBy/`
        );
        const now = new Date();
        const filteredTasks = (response.data.tasks || [])
          .filter(
            (task) =>
              task.dueDate && new Date(task.dueDate) > now && task.status.toLowerCase() !== "complete"
          ) // Exclude completed tasks and tasks past their due date
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Sort by due date
        setTasks(filteredTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [profileId]);

  // Fetch meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      setLoadingMeetings(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}meetings/list/${profileId}`
        );
        const now = new Date();
        const filteredMeetings = (response.data || [])
          .filter((meeting) => meeting.finalized && new Date(meeting.finalized_date) > now) // Exclude past meetings
          .sort((a, b) => new Date(a.finalized_date) - new Date(b.finalized_date)); // Sort by finalized date
        setMeetings(filteredMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setLoadingMeetings(false);
      }
    };
    fetchMeetings();
  }, [profileId]);

  // Handlers for See More/See Less
  const handleTaskPageChange = (direction) => {
    setTaskPage((prev) => prev + direction);
  };

  const handleMeetingPageChange = (direction) => {
    setMeetingPage((prev) => prev + direction);
  };

  return (
    <div className="home-page">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
        </header>

        <div className="dashboard-content">
          {/* Tasks Bubble */}
          <div className="bubble tasks-bubble">
            <h2>Upcoming Tasks</h2>
            {loadingTasks ? (
              <p>Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p>No upcoming tasks.</p>
            ) : (
              <>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>S/N</th>
                      <th>Task</th>
                      <th>Group</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks
                      .slice(taskPage * itemsPerPage, (taskPage + 1) * itemsPerPage)
                      .map((task, index) => (
                        <tr key={task.taskId}>
                          <td>{taskPage * itemsPerPage + index + 1}</td>
                          <td>{task.name}</td>
                          <td>{task.group || "-"}</td>
                          <td>{task.assignedTo || "Unassigned"}</td>
                          <td className={task.status.toLowerCase()}>{task.status}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="pagination-controls">
                  {taskPage > 0 && (
                    <button onClick={() => handleTaskPageChange(-1)}>See Less</button>
                  )}
                  {(taskPage + 1) * itemsPerPage < tasks.length && (
                    <button onClick={() => handleTaskPageChange(1)}>See More</button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Meetings Bubble */}
          <div className="bubble meetings-bubble">
            <h2>Upcoming Meetings</h2>
            {loadingMeetings ? (
              <p>Loading meetings...</p>
            ) : meetings.length === 0 ? (
              <p>No upcoming meetings.</p>
            ) : (
              <>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>S/N</th>
                      <th>Meeting</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings
                      .slice(meetingPage * itemsPerPage, (meetingPage + 1) * itemsPerPage)
                      .map((meeting, index) => (
                        <tr key={meeting.meetingId}>
                          <td>{meetingPage * itemsPerPage + index + 1}</td>
                          <td>{meeting.name}</td>
                          <td>{new Date(meeting.finalized_date).toLocaleDateString()}</td>
                          <td>
                            {new Date(meeting.finalized_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>{meeting.location || "TBC"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="pagination-controls">
                  {meetingPage > 0 && (
                    <button onClick={() => handleMeetingPageChange(-1)}>See Less</button>
                  )}
                  {(meetingPage + 1) * itemsPerPage < meetings.length && (
                    <button onClick={() => handleMeetingPageChange(1)}>See More</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;