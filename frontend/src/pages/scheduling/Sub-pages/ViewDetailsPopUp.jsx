import React from "react";
import "./GlobalMeeting.css";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";

const ViewDetailsPopUp = ({ meeting, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{meeting.name} - Details</h2>
        <p>
          <strong>Agenda:</strong> {meeting.agenda}
        </p>
        <p>
          <strong>Attendees:</strong>{" "}
          {meeting.attendees.length > 0 ? meeting.attendees.join(", ") : "None"}
        </p>
        <button className="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewDetailsPopUp;