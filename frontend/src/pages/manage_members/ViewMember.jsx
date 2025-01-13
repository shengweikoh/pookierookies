import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import EditMemberPopUp from "./PopUps/EditMember";
import DeleteConfirmPopUp from "./PopUps/DeleteMember";
import "./ViewMember.css";

const MemberDetails = () => {
  const location = useLocation();
  const member = location.state?.member;

  const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
  const [isDeletePopUpOpen, setIsDeletePopUpOpen] = useState(false);

  const mockTasks = [
    { id: 1, task: "Prepare presentation", dueDate: "2025-01-15" },
    { id: 2, task: "Submit report", dueDate: "2025-01-17" },
  ];

  if (!member) {
    return <div>No member data found. Please go back and select a member.</div>;
  }

  return (
    <div className="member-details-container">
      <Sidebar />
      <div className="main-content">
        <h1>{member.name}'s Details</h1>
        <h2>Upcoming Tasks</h2>
        <ul>
          {mockTasks.map((task) => (
            <li key={task.id}>
              {task.task} - Due: {task.dueDate}
            </li>
          ))}
        </ul>
        <div className="actions">
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

        {/* Edit Member Pop-Up */}
        {isEditPopUpOpen && (
          <EditMemberPopUp
            member={member}
            onClose={() => setIsEditPopUpOpen(false)}
            onSubmit={(updatedMember) => {
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
            onConfirm={() => console.log("Member Deleted")}
          />
        )}
      </div>
    </div>
  );
};

export default MemberDetails;