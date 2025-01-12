import React, { useState } from "react";
import "./FinaliseMeetingPopUp.css";

const UpdateMeetingPopUp = ({ meeting, onClose, onSubmit }) => {
  const [updatedMeeting, setUpdatedMeeting] = useState(meeting);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedMeeting((prev) => ({ ...prev, [name]: value }));
  };

  const handleFinalize = () => {
    onSubmit({ ...updatedMeeting, finalized: true });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Update Meeting</h2>
        <form>
          <label>
            Confirmed Location:
            <input
              type="text"
              name="location"
              value={updatedMeeting.location}
              onChange={handleChange}
            />
          </label>
          <label>
            Confirmed Date:
            <input
              type="datetime-local"
              name="dateRange"
              value={updatedMeeting.dateRange?.start}
              onChange={(e) =>
                setUpdatedMeeting((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value },
                }))
              }
            />
          </label>
          <button type="button" className="button" onClick={handleFinalize}>
            Finalize Meeting
          </button>
          <button type="button" className="button cancel-button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateMeetingPopUp;