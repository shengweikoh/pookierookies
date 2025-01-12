import React, { useState } from "react";
import "./EditPopUp.css";

const EditMeetingPopup = ({ meeting, onSave, onClose }) => {
  const [editedMeeting, setEditedMeeting] = useState(meeting);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMeeting((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedMeeting); // Save the edited meeting and pass it to the parent
  };

  return (
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
            <button type="button" className="button save-button" onClick={handleSave}>
              Save
            </button>
            <button
              type="button"
              className="button cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMeetingPopup;