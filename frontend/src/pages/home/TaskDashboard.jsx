import React, { useState } from 'react';
import './Home.css';

const TaskDashboard = () => {
  const [isInProgressOpen, setIsInProgressOpen] = useState(true);
  const [isToDoOpen, setIsToDoOpen] = useState(true);

return (
    <div className="dashboard">
      <div className="header">
      </div>
      <h2>My Tasks</h2>
      <div className="task-category">
        <div className="category-header" onClick={() => setIsInProgressOpen(!isInProgressOpen)}>
          <span>In Progress</span>
          <span>• 3 tasks</span>
        </div>
        {isInProgressOpen && (
          <div>
            <div className="task-headers">
              <span className="header-name">Name</span>
              <span className="header-priority">Priority</span>
              <span className="header-due-date">Due Date</span>
            </div>
            <ul>
              <li>
                <div className="task-name">
                  <input type="checkbox" />
                  <span>One-on-One Meeting</span>
                </div>
                <span className="priority high">High</span>
                <span className="due-date">Today</span>
              </li>
              <li>
                <div className="task-name">
                  <input type="checkbox" />
                  <span>Send a summary email to stakeholders</span>
                </div>
                <span className="priority low">Low</span>
                <span className="due-date">3 days left</span>
              </li>
              <li>
                <div className="task-name">
                  <input type="checkbox" />
                  <span>Identify any blockers and plan solutions</span>
                </div>
                <span className="priority low">Low</span>
                <span className="due-date">5 days left</span>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="task-category">
        <div className="category-header" onClick={() => setIsToDoOpen(!isToDoOpen)}>
          <span>To Do</span>
          <span>• 1 task</span>
        </div>
        {isToDoOpen && (
          <div>
            <div className="task-headers">
              <span className="header-name">Name</span>
              <span className="header-priority">Priority</span>
              <span className="header-due-date">Due Date</span>
            </div>
            <ul>
              <li>
                <div className="task-name">
                  <input type="checkbox" />
                  <span>Compile meeting minutes</span>
                </div>
                <span className="priority normal">Normal</span>
                <span className="due-date">5 days left</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;