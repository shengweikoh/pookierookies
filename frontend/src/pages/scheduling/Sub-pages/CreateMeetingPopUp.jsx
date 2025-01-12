import React, { useState } from "react";
import "./CreateMeetingPopUp.css";

const CreateMeetingPopUp = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [agenda, setAgenda] = useState("");
  const [attendees, setAttendees] = useState("");
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      agenda,
      attendees: attendees.split(",").map((email) => email.trim()),
      location: location || "TBC",
      dateRange,
      finalized: false,
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Create New Meeting</h2>
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
              required
            />
          </label>
          <label>
            Attendees (comma-separated emails):
            <input
              type="text"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              required
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="TBC if undecided"
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
          <button type="submit" className="button">Add Meeting</button>
          <button type="button" className="button cancel-button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingPopUp;