import React, { useEffect, useState } from "react";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";

const CreateMeetingPopUp = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [agenda, setAgenda] = useState("");
  const [attendees, setAttendees] = useState("");
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [successMessage, setSuccessMessage] = useState(false); // Success message state

  useEffect(() => {
    // Add event listener for Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose(); // Close the pop-up
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      agenda,
      attendees: attendees.split(",").map((email) => email.trim()),
      location, // Location can remain blank
      dateRange,
      finalized: false,
    });
    setSuccessMessage(true); // Show success message
    setTimeout(() => setSuccessMessage(false), 3000); // Hide message after 3 seconds
    onClose(); // Close the pop-up
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Create New Meeting</h2>
        {successMessage && (
          <p className="success-message">Meeting created successfully!</p>
        )}
        <form onSubmit={handleSubmit}>
          <label>
            Meeting Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Agenda:
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows="3"
              placeholder="Enter the meeting agenda"
              style={{
                overflowY: "auto", // Enable vertical scrolling
              }}
              required
            />
          </label>
          <label>
            Attendees (comma-separated emails):
            <textarea
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              rows="3"
              placeholder="Enter attendee emails, separated by commas"
              style={{
                overflowY: "auto", // Enable vertical scrolling
              }}
              required
            />
          </label>
          <label>
            Location (optional):
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label>
            Date Range:
            <input
              type="datetime-local"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              required
            />
            <input
              type="datetime-local"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              required
            />
          </label>
          <div className="popup-buttons">
            <button type="submit" className="button">Add Meeting</button>
            <button type="button" className="button cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingPopUp;