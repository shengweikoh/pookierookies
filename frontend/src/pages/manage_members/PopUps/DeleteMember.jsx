import React, { useState } from "react";
import axios from "axios";
import "./MemberPopUp.css";
import { getLoggedInUserId } from "../../../Components/utils";

const profileId = getLoggedInUserId();

const DeleteConfirmPopUp = ({ member, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Replace with your backend delete endpoint
      await axios.delete(`${process.env.REACT_APP_BACKEND_BASE_URL}members/delete/${profileId
      }/${member.id}/`);
      onConfirm(); // Notify parent component of successful deletion
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete the member. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Confirm Delete</h2>
        <p>
          Are you sure you want to delete <strong>{member.name}</strong>?
        </p>
        <div className="popup-buttons">
          <button
            className="button delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            className="button cancel-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmPopUp;