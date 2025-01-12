import React, { useState } from "react";
import Sidebar from "../../../Components/Sidebar"; // Import your existing sidebar
import CreateMeetingPopUp from "../../../pages/scheduling/Sub-pages/CreateMeetingPopUp";
import FinaliseMeetingPopUp from "../../../pages/scheduling/Sub-pages/FinaliseMeetingPopUp";
import "./UnfinalisedMeetings.css";


const UnfinalizedMeetings = () => {
    const [meetings, setMeetings] = useState([
      {
        id: 1,
        name: "Team Brainstorm",
        agenda: "Discuss project ideas",
        attendees: ["john@example.com", "jane@example.com"],
        location: "TBC",
        dateRange: { start: "2025-01-20T10:00", end: "2025-01-20T11:00" },
        finalized: false,
      },
    ]);
  
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
    const [currentMeeting, setCurrentMeeting] = useState(null);
  
    const openCreatePopup = () => setIsCreatePopupOpen(true);
    const closeCreatePopup = () => setIsCreatePopupOpen(false);
  
    const openUpdatePopup = (meeting) => {
      setCurrentMeeting(meeting);
      setIsUpdatePopupOpen(true);
    };
    const closeUpdatePopup = () => setIsUpdatePopupOpen(false);
  
    const addMeeting = (newMeeting) => {
      setMeetings((prev) => [...prev, { id: prev.length + 1, ...newMeeting }]);
      closeCreatePopup();
    };
  
    const finalizeMeeting = (updatedMeeting) => {
      setMeetings((prev) => prev.filter((meeting) => meeting.id !== updatedMeeting.id));
      closeUpdatePopup();
    };
  
    return (
      <div className="unfinalized-meetings-container">
        <Sidebar />
        <div className="main-content">
          <div className="header">
            <h1>Unfinalized Meetings</h1>
            <button className="button" onClick={openCreatePopup}>
              Create New Meeting
            </button>
          </div>
  
          <section>
            <h2>Meetings Awaiting Finalization</h2>
            {meetings.length > 0 ? (
              meetings.map((meeting) => (
                <div key={meeting.id} className="meeting-item">
                  <div className="meeting-details">
                    <h3>{meeting.name}</h3>
                    <p><strong>Agenda:</strong> {meeting.agenda}</p>
                    <p>
                      <strong>Proposed Date/Time:</strong> {meeting.dateRange.start} -{" "}
                      {meeting.dateRange.end}
                    </p>
                    <p><strong>Location:</strong> {meeting.location}</p>
                  </div>
                  <button
                    className="update-button"
                    onClick={() => openUpdatePopup(meeting)}
                  >
                    Update
                  </button>
                </div>
              ))
            ) : (
              <p>No unfinalized meetings available.</p>
            )}
          </section>
  
          {/* Pop-ups */}
          {isCreatePopupOpen && (
            <CreateMeetingPopUp onClose={closeCreatePopup} onSubmit={addMeeting} />
          )}
          {isUpdatePopupOpen && (
            <FinaliseMeetingPopUp
              meeting={currentMeeting}
              onClose={closeUpdatePopup}
              onSubmit={finalizeMeeting}
            />
          )}
        </div>
      </div>
    );
  };
  
  export default UnfinalizedMeetings;