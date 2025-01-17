import React, { useState } from "react";
import axios from "axios";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";

const SendReminderPopUp = ({ meetings, userId, onClose }) => {
  const [selectedMeeting, setSelectedMeeting] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReminder = async () => {
    if (!selectedMeeting) {
      alert("Please select a meeting.");
      return;
    }

    setIsLoading(true);

    try {
      // Make POST request to send reminder
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}reminders/send/`, {
        meeting_id: selectedMeeting,
        user_id: userId,
      });

      if (response.status === 200) {
        alert(`Reminder sent successfully for meeting: ${meetings.find(meeting => meeting.id === selectedMeeting)?.name}`);
        onClose();
      } else {
        console.error("Unexpected response:", response);
        alert("Failed to send reminder. Please try again.");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("An error occurred while sending the reminder. Please try again.");
    } finally {
      setIsLoading(false);
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
            <option key={meeting.id} value={meeting.id}>
              {meeting.name}
            </option>
          ))}
        </select>
        <div className="popup-buttons">
          <button className="button" onClick={handleSendReminder} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reminder"}
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