import React, { useState } from "react";
import Sidebar from "../../../Components/Sidebar";
import CreateMeetingPopUp from "../../../pages/scheduling/Sub-pages/CreateMeetingPopUp";
import FinaliseMeetingPopUp from "../../../pages/scheduling/Sub-pages/FinaliseMeetingPopUp";
import SendDetailsPopUp from "../../../pages/scheduling/Sub-pages/SendDetailsPopUp";
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
  const [isSendPopupOpen, setIsSendPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);

  const openCreatePopup = () => setIsCreatePopupOpen(true);
  const closeCreatePopup = () => setIsCreatePopupOpen(false);

  const openUpdatePopup = (meeting) => {
    setCurrentMeeting(meeting);
    setIsUpdatePopupOpen(true);
  };
  const closeUpdatePopup = () => setIsUpdatePopupOpen(false);

  const openSendPopup = (meeting) => {
    setCurrentMeeting(meeting);
    setIsSendPopupOpen(true);
  };
  const closeSendPopup = () => setIsSendPopupOpen(false);

  const openDeletePopup = (meeting) => {
    setCurrentMeeting(meeting);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => setIsDeletePopupOpen(false);

  const handleDeleteMeeting = () => {
    setMeetings((prev) => prev.filter((meeting) => meeting.id !== currentMeeting.id));
    closeDeletePopup();
  };

  return (
    <div className="unfinalized-meetings-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1>Unfinalised Meetings</h1>
          <button className="button" onClick={openCreatePopup}>
            Create New Meeting
          </button>
        </div>

        <section>
          <h2>Meetings Awaiting Finalisation</h2>
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
                <div className="meeting-buttons">
                  <button
                    className="send-details-button"
                    onClick={() => openSendPopup(meeting)}
                  >
                    Send Details
                  </button>
                  <button
                    className="update-button"
                    onClick={() => openUpdatePopup(meeting)}
                  >
                    Update
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => openDeletePopup(meeting)}
                  >
                    Delete Meeting
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No unfinalized meetings available.</p>
          )}
        </section>

        {/* Pop-ups */}
        {isCreatePopupOpen && (
          <CreateMeetingPopUp onClose={closeCreatePopup} onSubmit={(newMeeting) => {
            setMeetings((prev) => [...prev, { id: prev.length + 1, ...newMeeting }]);
            closeCreatePopup();
          }} />
        )}
        {isUpdatePopupOpen && (
          <FinaliseMeetingPopUp
            meeting={currentMeeting}
            onClose={closeUpdatePopup}
          />
        )}
        {isSendPopupOpen && currentMeeting && (
          <SendDetailsPopUp
            attendees={currentMeeting.attendees}
            onClose={closeSendPopup}
            onSend={(recipients) => {
              console.log("Details sent to:", recipients);
              closeSendPopup();
            }}
          />
        )}
        {isDeletePopupOpen && (
          <div className="delete-popup-overlay">
            <div className="delete-popup-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete the meeting <strong>{currentMeeting.name}</strong>?</p>
              <div className="popup-buttons">
                <button className="button" onClick={handleDeleteMeeting}>
                  Yes, Delete
                </button>
                <button className="button cancel-button" onClick={closeDeletePopup}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnfinalizedMeetings;