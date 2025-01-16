import React, { useState } from "react";
import axios from "axios";
import "./PopUps.css";

const DeleteMeetingPopUp = ({ meetingId, meetingName, onClose, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_BASE_URL}meetings/${meetingId}/delete/`);
      alert("Meeting deleted successfully!");
      onDeleteSuccess(); // Notify parent component of successful deletion
      onClose(); // Close the pop-up
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Failed to delete the meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete the meeting:</p>
        <p>
          <strong>{meetingName}</strong>?
        </p>
        <p>This action cannot be undone.</p>
        <div className="popup-buttons">
          <button
            className="button delete-button"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
          <button className="button cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMeetingPopUp;