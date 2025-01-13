import React from "react";
import "./MemberPopUp.css";

const DeleteConfirmPopUp = ({ member, onClose, onConfirm }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete <strong>{member.name}</strong>?</p>
        <div className="popup-buttons">
          <button className="button delete-button" onClick={onConfirm}>
            Yes, Delete
          </button>
          <button className="button cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmPopUp;