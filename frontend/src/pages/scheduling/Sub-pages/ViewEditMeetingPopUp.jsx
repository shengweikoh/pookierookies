import React, { useState } from "react";
import axios from "axios";
import "./PopUps.css";
import "./Meetings.css";

const ViewEditMeetingPopUp = ({ meeting, userId, onClose }) => {
  console.log("Meeting Data:", meeting); // Debug: Inspect incoming data

  const [formData, setFormData] = useState({
    name: meeting.name || "",
    agenda: meeting.agenda || "",
    location: meeting.location || "",
    duration: meeting.duration || "",
    attendees: Array.isArray(meeting.attendees)
      ? meeting.attendees
          .filter((email) => typeof email === "string" && email.trim()) // Filter valid strings
          .join(", ") // Join valid emails into a comma-separated string
      : "", // Fallback to empty string
  });

  console.log("Parsed Attendees:", formData.attendees); // Debug: Inspect parsed attendees

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.agenda || !formData.location || !formData.duration) {
      alert("All fields are required!");
      return;
    }

    const updatedData = {
      ...formData,
      user_id: userId,
      attendees: formData.attendees
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email), // Filter out empty strings
    };

    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}meetings/${meeting.meetingId}/edit/`,
        updatedData
      );
      alert("Meeting updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating meeting:", error);
      alert("Failed to update meeting. Please try again.");
    }
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
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Agenda:
            <textarea
              name="agenda"
              value={formData.agenda}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Duration (hours):
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              min="1"
            />
          </label>
          <label>
            Attendees (comma-separated emails):
            <textarea
              className="attendees-input"
              name="attendees"
              value={formData.attendees}
              onChange={handleInputChange}
              required
            />
          </label>
        </form>
        <div className="popup-buttons">
          <button type="button" className="button" onClick={handleSave}>
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
      </div>
    </div>
  );
};

export default ViewEditMeetingPopUp;