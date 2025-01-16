import React, { useEffect, useState } from "react";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";
import axios from "axios"; // Ensure axios is installed

const CreateMeetingPopUp = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [agenda, setAgenda] = useState("");
  const [attendees, setAttendees] = useState("");
  const [proposedDates, setProposedDates] = useState([{ id: 1, value: "" }]);
  const [pollDeadline, setPollDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

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

  const handleProposedDateChange = (id, value) => {
    setProposedDates((prevDates) =>
      prevDates.map((date) =>
        date.id === id ? { ...date, value } : date
      )
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

    // Prepare the new meeting data
    const newMeeting = {
      name,
      agenda,
      attendees: attendees.split(",").map((email) => email.trim()),
      proposed_dates: formattedDates,
      poll_deadline: pollDeadline,
    };

    try {
      // Replace with your actual API URL
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}meetings/create/`, newMeeting);

      // Call parent onSubmit with created meeting data
      onSubmit(response.data);

      setSuccessMessage(true); // Show success message
      setTimeout(() => setSuccessMessage(false), 3000); // Hide after 3 seconds
      onClose(); // Close the pop-up
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
                rows="3"
                placeholder="Enter the meeting agenda"
                style={{ overflowY: "auto" }}
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
            <label>Proposed Dates:</label>
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
            <button type="button" className="button add-date-button" onClick={addProposedDate}>
              Add Another Date
            </button>
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