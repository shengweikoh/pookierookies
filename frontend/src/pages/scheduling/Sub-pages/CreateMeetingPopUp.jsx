import React, { useEffect, useState } from "react";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";
import axios from "axios";
import { getLoggedInUserId } from "../../../Components/utils";

const CreateMeetingPopUp = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [agenda, setAgenda] = useState("");
  const [attendees, setAttendees] = useState("");
  const [proposedDates, setProposedDates] = useState([{ id: 1, value: "" }]);
  const [pollDeadline, setPollDeadline] = useState("");
  const [location, setLocation] = useState(""); // Location is optional
  const [duration, setDuration] = useState(""); // Duration is required
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const profileId = getLoggedInUserId();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleProposedDateChange = (id, value) => {
    setProposedDates((prevDates) =>
      prevDates.map((date) => (date.id === id ? { ...date, value } : date))
    );
  };

  const addProposedDate = () => {
    setProposedDates((prevDates) => [
      ...prevDates,
      { id: prevDates.length + 1, value: "" },
    ]);
  };

  const removeProposedDate = (id) => {
    setProposedDates((prevDates) => prevDates.filter((date) => date.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedDates = proposedDates
      .map((date) => date.value.trim())
      .filter((date) => date); // Filter out any empty inputs

    const newMeeting = {
      name: name,
      agenda: agenda,
      attendees: attendees.split(",").map((email) => email.trim()),
      proposed_dates: formattedDates,
      poll_deadline: pollDeadline,
      location: location.trim() || null, // If blank, send `null` to backend
      duration: duration,
      profile_id: profileId, // Add profileId here
    };

    console.log(newMeeting);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}meetings/create/`,
        newMeeting
      );


      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
      onClose();
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Failed to create meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Create New Meeting</h2>
        {successMessage && (
          <p className="success-message">Meeting created successfully!</p>
        )}
        <div className="popup-scrollable-content">
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
                rows={agenda.length > 50 ? 5 : 2} // Adjust rows dynamically
                placeholder="Enter the meeting agenda"
                style={{ overflowY: "auto" }}
                required
              />
            </label>
            <label>
              Location (optional):
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter the meeting location (optional)"
              />
            </label>
            <label>
              Duration (in hours):
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="0"
                placeholder="Enter duration in hours"
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
                style={{ overflowY: "auto" }}
                required
              />
            </label>
            <label>Proposed Dates:
              {proposedDates.map((date, index) => (
                <div key={date.id} className="date-input-container">
                  <input
                    type="datetime-local"
                    value={date.value}
                    onChange={(e) => handleProposedDateChange(date.id, e.target.value)}
                    required
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      className="remove-date-button"
                      onClick={() => removeProposedDate(date.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="button add-date-button"
                onClick={addProposedDate}
              >
                Add Another Date
              </button>
              </label>
            <label>
              Poll Deadline:
              <input
                type="datetime-local"
                value={pollDeadline}
                onChange={(e) => setPollDeadline(e.target.value)}
                required
              />
            </label>
            <div className="popup-buttons">
              <button type="submit" className="button" disabled={loading}>
                {loading ? "Adding..." : "Add Meeting"}
              </button>
              <button type="button" className="button cancel-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingPopUp;