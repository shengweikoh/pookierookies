import React, { useState } from "react";
import axios from "axios";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";

const FinaliseMeetingPopUp = ({ meeting, onClose }) => {
  const [finalizedMeeting, setFinalizedMeeting] = useState({
    ...meeting,
    confirmedDate: meeting.confirmedDate || "",
    location: meeting.location || "",
  });
  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    // Check for required fields
    if (!finalizedMeeting.confirmedDate || !finalizedMeeting.location.trim()) {
      alert("Please fill in all fields before finalizing the meeting.");
      return;
    }

    setLoading(true);
    try {
      const finalizedData = {
        ...finalizedMeeting,
        finalized: true, // Set the finalized flag
      };

      // Send PUT request to finalize the meeting
      await axios.put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}meetings/${meeting.meetingId}/edit/`,
        finalizedData
      );

      alert("Meeting finalized successfully!");
      onClose(); // Close the pop-up
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
        <form>
          <label>
            Confirmed Location:
            <input
              type="text"
              name="location"
              value={finalizedMeeting.location}
              onChange={(e) =>
                setFinalizedMeeting((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              placeholder="Enter confirmed location"
              required
            />
          </label>
          <label>
            Confirmed Date:
            <select
              name="confirmedDate"
              value={finalizedMeeting.confirmedDate}
              onChange={(e) =>
                setFinalizedMeeting((prev) => ({
                  ...prev,
                  confirmedDate: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                Select a date
              </option>
              {meeting.proposed_dates.map((date, index) => (
                <option key={index} value={date}>
                  {new Date(date).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </option>
              ))}
            </select>
          </label>
          <div className="popup-buttons">
            <button
              type="button"
              className="button"
              onClick={handleFinalize}
              disabled={loading}
            >
              {loading ? "Finalizing..." : "Finalize"}
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

export default FinaliseMeetingPopUp;