import React, { useState } from 'react';
import './Home.css';

const TaskDashboard = () => {
  const [isInProgressOpen, setIsInProgressOpen] = useState(true);
  const [isToDoOpen, setIsToDoOpen] = useState(true);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'One-on-One Meeting',
      priority: 'High',
      dueDate: 'Today',
      subtasks: [
        { id: '1.1', name: 'Prepare meeting agenda', completed: false },
        { id: '1.2', name: 'Send calendar invite', completed: true },
      ],
      isSubtasksOpen: false,
    },
    {
      id: 2,
      name: 'Send a summary email to stakeholders',
      priority: 'Low',
      dueDate: '3 days left',
      subtasks: [],
      isSubtasksOpen: false,
    },
    {
      id: 3,
      name: 'Identify any blockers and plan solutions',
      priority: 'Low',
      dueDate: '5 days left',
      subtasks: [],
      isSubtasksOpen: false,
    },
  ]);

  const toggleSubtasks = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, isSubtasksOpen: !task.isSubtasksOpen } : task
      )
    );
  };

  return (
    <div className="dashboard">
      {/* "In Progress" Section */}
      <div className="task-category">
        <div
          className="category-header"
          onClick={() => setIsInProgressOpen(!isInProgressOpen)}
        >
          <span>In Progress</span>
          <span>• {tasks.length} tasks</span>
        </div>
        {isInProgressOpen && (
          <div>
            <div className="task-headers">
              <span className="header-name">Name</span>
              <span className="header-priority">Priority</span>
              <span className="header-due-date">Due Date</span>
            </div>
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>
                  <div className="task-name">
                    {task.subtasks.length > 0 && (
                      <button
                        className="dropdown-arrow"
                        onClick={() => toggleSubtasks(task.id)}
                      >
                        {task.isSubtasksOpen ? '▼' : '▶'}
                      </button>
                    )}
                    <input type="checkbox" />
                    <span>{task.name}</span>
                  </div>
                  <span className={`priority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span className="due-date">{task.dueDate}</span>
                  {task.isSubtasksOpen && task.subtasks.length > 0 && (
                    <ul className="subtasks">
                      {task.subtasks.map((subtask) => (
                        <li key={subtask.id}>
                          <div className="task-name">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              readOnly
                            />
                            <span>{subtask.name}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* "To Do" Section */}
      <div className="task-category">
        <div
          className="category-header"
          onClick={() => setIsToDoOpen(!isToDoOpen)}
        >
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
                  <button className="dropdown-arrow" disabled>
                    {/* No subtasks for this item */}
                  </button>
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