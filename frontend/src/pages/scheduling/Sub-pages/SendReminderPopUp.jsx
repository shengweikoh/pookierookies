import React, { useState } from "react";
import "./GlobalMeeting.css";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";

const SendReminderPopUp = ({ meetings, onClose }) => {
  const [selectedMeeting, setSelectedMeeting] = useState("");

  const handleSendReminder = () => {
    if (selectedMeeting) {
      console.log(`Reminder sent for meeting: ${selectedMeeting}`);
      alert(`Reminder sent for meeting: ${selectedMeeting}`);
      onClose();
    } else {
      alert("Please select a meeting.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Send Reminder</h2>
        <select
          value={selectedMeeting}
          onChange={(e) => setSelectedMeeting(e.target.value)}
          className="dropdown"
        >
          <option value="">Select a Meeting</option>
          {meetings.map((meeting) => (
            <option key={meeting.id} value={meeting.name}>
              {meeting.name}
            </option>
          ))}
        </select>
        <div className="popup-buttons">
          <button className="button" onClick={handleSendReminder}>
            Send Reminder
          </button>
          <button className="button cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendReminderPopUp;