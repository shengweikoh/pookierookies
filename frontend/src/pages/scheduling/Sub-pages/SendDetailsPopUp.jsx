import React, { useState } from "react";
import axios from "axios";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";

const SendDetailsPopUp = ({ meetingId, userId, onClose }) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendDetails = async () => {
    if (!meetingId || !userId) {
      alert("Invalid meeting or user ID.");
      return;
    }

    setIsSending(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}meetings/send-emails/`,
        {
          meetingId,
          userId,
        }
      );
      alert("Meeting details sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending meeting details:", error);
      alert("Failed to send meeting details. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Send Meeting Details</h2>
        <p>Are you sure you want to send meeting details to attendees?</p>
        <div className="popup-buttons">
          <button
            className="button"
            onClick={handleSendDetails}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Confirm"}
          </button>
          <button className="button cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendDetailsPopUp;