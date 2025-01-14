import React, { useState } from "react";
import "./GlobalMeeting.css";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";

const EditMeetingPopup = ({ meeting, onSave, onClose, onDelete }) => {
  const [editedMeeting, setEditedMeeting] = useState(meeting);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMeeting((prev) => ({ ...prev, [name]: value }));
  };

  const openConfirmDelete = () => {
    setIsConfirmDeleteOpen(true); // Show Confirm Delete Pop-Up
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false); // Hide Confirm Delete Pop-Up
  };

  const confirmDelete = () => {
    onDelete(meeting.id); // Call the delete handler passed from the parent
    setIsConfirmDeleteOpen(false); // Close Confirm Delete Pop-Up
    onClose(); // Close the Edit Meeting pop-up
  };

  return (
    <>
      <div className="popup-overlay">
        <div className="popup-content">
          <h2>Edit Meeting</h2>
          <form>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={editedMeeting.name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Date:
              <input
                type="text"
                name="date"
                value={editedMeeting.date}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Time:
              <input
                type="text"
                name="time"
                value={editedMeeting.time}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Location:
              <input
                type="text"
                name="location"
                value={editedMeeting.location}
                onChange={handleInputChange}
              />
            </label>
            <div className="popup-buttons">
              <button type="button" className="button save-button" onClick={() => onSave(editedMeeting)}>
                Save
              </button>
              <button type="button" className="button cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="button delete-button" onClick={openConfirmDelete}>
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Delete Pop-Up */}
      {isConfirmDeleteOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Confirm Delete</h2>
            <p>WARNING: THIS ACTION CANNOT BE UNDONE! </p>
            <p>Are you sure you want to delete this meeting?</p>
            <div className="popup-buttons">
              <button type="button" className="button delete-button" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button type="button" className="button cancel-button" onClick={closeConfirmDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditMeetingPopup;