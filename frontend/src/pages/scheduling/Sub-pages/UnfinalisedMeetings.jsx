import React, { useState, useEffect } from "react";
import Sidebar from "../../../Components/Sidebar";
import CreateMeetingPopUp from "../../../pages/scheduling/Sub-pages/CreateMeetingPopUp";
import FinaliseMeetingPopUp from "../../../pages/scheduling/Sub-pages/FinaliseMeetingPopUp";
import SendDetailsPopUp from "../../../pages/scheduling/Sub-pages/SendDetailsPopUp";
import "./UnfinalisedMeetings.css";
import axios from "axios";

// Utility function to format date
const formatDate = (isoDate) => {
  const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(isoDate).toLocaleString(undefined, options);
};

const UnfinalizedMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [isSendPopupOpen, setIsSendPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);

  // Fetch meetings from the API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get("http://your-backend-url/api/meetings");
        const unfinalizedMeetings = response.data.filter((meeting) => !meeting.finalized);
        setMeetings(unfinalizedMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        alert("Failed to load meetings. Please try again.");
      }
    };

    fetchMeetings();
  }, []);

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

  const handleDeleteMeeting = async () => {
    try {
      await axios.delete(`http://your-backend-url/api/meetings/${currentMeeting.meetingId}`);
      setMeetings((prev) => prev.filter((meeting) => meeting.meetingId !== currentMeeting.meetingId));
      closeDeletePopup();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Failed to delete meeting. Please try again.");
    }
  };

  return (
    <div className="schedule-meeting-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1 className="header-title">Unfinalised Meetings</h1>
          <div className="header-buttons">
            <button className="button" onClick={openCreatePopup}>
              Create New Meeting
            </button>
          </div>
        </div>

        <section className="upcoming-meetings">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting.meetingId} className="meeting-item">
                <div className="meeting-details">
                  <p className="meeting-name">{meeting.name}</p>
                  <p className="meeting-title">
                    <strong>Agenda:</strong> {meeting.agenda}
                  </p>
                  <p className="meeting-title">
                    <strong>Proposed Dates:</strong>{" "}
                    {meeting.proposed_dates?.map((date, index) => (
                      <span key={index}>{formatDate(date)}{index < meeting.proposed_dates.length - 1 ? ", " : ""}</span>
                    ))}
                  </p>
                  <p className="meeting-title">
                    <strong>Poll Deadline:</strong> {meeting.poll_deadline ? formatDate(meeting.poll_deadline) : "N/A"}
                  </p>
                  <p className="meeting-location">
                    <strong>Location:</strong> {meeting.location || "TBC"}
                  </p>
                  <p className="meeting-location">
                    <strong>Poll Link:</strong>{" "}
                    <a href={meeting.poll_link} target="_blank" rel="noopener noreferrer">
                      {meeting.poll_link}
                    </a>
                  </p>
                </div>
                <div className="button-group">
                  <button
                    className="view-details-button"
                    onClick={() => openSendPopup(meeting)}
                  >
                    Send Details
                  </button>
                  <button
                    className="edit-button"
                    onClick={() => openUpdatePopup(meeting)}
                  >
                    Update
                  </button>
                  <button
                    className="view-details-button"
                    style={{ backgroundColor: "#dc3545" }}
                    onClick={() => openDeletePopup(meeting)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No unfinalized meetings available.</p>
          )}
        </section>

        {/* Create Meeting Pop-Up */}
        {isCreatePopupOpen && (
          <CreateMeetingPopUp
            onClose={closeCreatePopup}
            onSubmit={(newMeeting) => {
              setMeetings((prev) => [...prev, newMeeting]);
              closeCreatePopup();
            }}
          />
        )}

        {/* Update Meeting Pop-Up */}
        {isUpdatePopupOpen && (
          <FinaliseMeetingPopUp meeting={currentMeeting} onClose={closeUpdatePopup} />
        )}

        {/* Send Details Pop-Up */}
        {isSendPopupOpen && currentMeeting && (
          <SendDetailsPopUp
            attendees={currentMeeting.attendees.map((attendee) => attendee.email)}
            onClose={closeSendPopup}
            onSend={(recipients) => {
              console.log("Details sent to:", recipients);
              closeSendPopup();
            }}
          />
        )}

        {/* Delete Confirmation Pop-Up */}
        {isDeletePopupOpen && (
          <div className="delete-popup-overlay">
            <div className="delete-popup-content">
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete the meeting{" "}
                <strong>{currentMeeting.name}</strong>?
              </p>
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