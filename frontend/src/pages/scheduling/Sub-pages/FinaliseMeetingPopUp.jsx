import React, { useState } from "react";
import axios from "axios";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";
import { getLoggedInUserId } from "../../../Components/utils";

const FinaliseMeetingPopUp = ({ meeting, onClose }) => {
  const [loading, setLoading] = useState(false);

  const profileId = getLoggedInUserId(); // Get the user ID

  const handleFinalize = async () => {
    setLoading(true);
    try {
      // Send only the required parameters to the endpoint
      const finalizedData = {
        meeting_id: meeting.meetingId, // Meeting ID
        user_id: profileId, // Logged-in user's ID
      };

      await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}meetings/finalize/`,
        finalizedData
      );

      alert("Meeting finalized successfully!");
      onClose();
    } catch (error) {
      console.error("Error finalizing meeting:", error);
      alert("Failed to finalize the meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Finalize Meeting</h2>
        <p>
          Are you sure you want to finalize this meeting? This action cannot be undone.
        </p>
        <div className="popup-buttons">
          <button
            type="button"
            className="button"
            onClick={handleFinalize}
            disabled={loading}
          >
            {loading ? "Finalizing..." : "Confirm"}
          </button>
          <button
            type="button"
            className="button cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinaliseMeetingPopUp;