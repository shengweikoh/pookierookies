import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../../Components/Sidebar";
import EditMemberPopUp from "../PopUps/EditMember";
import DeleteConfirmPopUp from "../PopUps/DeleteMember";
import "./ViewMember.css";

const MemberDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [member, setMember] = useState(location.state?.member);

  const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
  const [isDeletePopUpOpen, setIsDeletePopUpOpen] = useState(false);

  const mockTasks = [
    { id: 1, task: "Prepare presentation", dueDate: "2025-01-15" },
    { id: 2, task: "Submit report", dueDate: "2025-01-17" },
  ];

  const mockMeetings = [
    { id: 1, meeting: "Team Brainstorm", date: "2025-01-18", time: "10:00 AM" },
    { id: 2, meeting: "UX Testing", date: "2025-01-20", time: "2:00 PM" },
  ];

  if (!member) {
    return (
      <div className="member-details-container">
        <Sidebar />
        <div className="main-content">
          <h1>No member data found</h1>
          <button onClick={() => navigate("/tools/manage-people")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="member-details-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <h1>{member.name}</h1>
          </div>
          <div className="header-right">
            <button
              className="normal-button"
              onClick={() => setIsEditPopUpOpen(true)}
            >
              Edit Member
            </button>
            <button
              className="danger-button"
              onClick={() => setIsDeletePopUpOpen(true)}
            >
              Delete Member
            </button>
          </div>
        </div>
        <div className="member-info">
          <p>
            <strong>Email:</strong> {member.email || "N/A"}
          </p>
          <p>
            <strong>Group:</strong> {member.group || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {member.role || "N/A"}
          </p>
        </div>
        <h2>Upcoming Tasks</h2>
        <ul>
          {mockTasks.map((task) => (
            <li key={task.id}>
              {task.task} - Due: {task.dueDate}
            </li>
          ))}
        </ul>

        <h2>Upcoming Meetings</h2>
        <ul>
          {mockMeetings.map((meeting) => (
            <li key={meeting.id}>
              {meeting.meeting} - {meeting.date} at {meeting.time}
            </li>
          ))}
        </ul>

        {/* Edit Member Pop-Up */}
        {isEditPopUpOpen && (
          <EditMemberPopUp
            member={member}
            onClose={() => setIsEditPopUpOpen(false)}
            onSubmit={(updatedMember) => {
              setMember(updatedMember); // Update member details
              console.log("Updated Member:", updatedMember);
              setIsEditPopUpOpen(false);
            }}
          />
        )}

        {/* Delete Confirmation Pop-Up */}
        {isDeletePopUpOpen && (
          <DeleteConfirmPopUp
            member={member}
            onClose={() => setIsDeletePopUpOpen(false)}
            onConfirm={() => {
              navigate("/tools/manage-people"); // Redirect after deletion
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MemberDetails;