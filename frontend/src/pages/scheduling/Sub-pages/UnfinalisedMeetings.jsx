import React, { useState, useEffect } from "react";
import Sidebar from "../../../Components/Sidebar";
import CreateMeetingPopUp from "../../../pages/scheduling/Sub-pages/CreateMeetingPopUp";
import FinaliseMeetingPopUp from "../../../pages/scheduling/Sub-pages/FinaliseMeetingPopUp";
import SendDetailsPopUp from "../../../pages/scheduling/Sub-pages/SendDetailsPopUp";
import DeleteMeetingPopUp from "../../../pages/scheduling/Sub-pages/DeleteMeetingPopUp"; // Import the new component
import "./UnfinalisedMeetings.css";
import axios from "axios";
import { getLoggedInUserId } from "../../../Components/utils";

// Utility function to format date
const formatDate = (isoDate) => {
  const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(isoDate).toLocaleString(undefined, options);
};

const UnfinalizedMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [showAllMeetings, setShowAllMeetings] = useState(false); // Toggle for showing more/less meetings
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [isSendPopupOpen, setIsSendPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const profileId = getLoggedInUserId();

  // Fetch meetings from the API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}meetings/list/${profileId}`);
        const unfinalizedMeetings = response.data.filter((meeting) => !meeting.finalized);
        setMeetings(unfinalizedMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        alert("Failed to load meetings. Please try again.");
      }
    };

    fetchMeetings();
  }, [profileId]);

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

  const handleDeleteSuccess = () => {
    setMeetings((prev) => prev.filter((meeting) => meeting.meetingId !== currentMeeting.meetingId));
  };

  const visibleMeetings = showAllMeetings ? meetings : meetings.slice(0, 3); // Show all or only first 3 meetings

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
          {visibleMeetings.length > 0 ? (
            visibleMeetings.map((meeting) => (
              <div key={meeting.meetingId} className="meeting-item">
                <div className="meeting-details">
                  <p className="meeting-name">{meeting.name}</p>
                  <p className="meeting-title">
                    <strong>Agenda:</strong> {meeting.agenda}
                  </p>
                  <p className="meeting-title">
                    <strong>Proposed Dates:</strong>{" "}
                    {meeting.proposed_dates?.map((date, index) => (
                      <span key={index}>
                        {formatDate(date)}
                        {index < meeting.proposed_dates.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                  <p className="meeting-title">
                    <strong>Poll Deadline:</strong>{" "}
                    {meeting.poll_deadline ? formatDate(meeting.poll_deadline) : "N/A"}
                  </p>
                  <p className="meeting-location">
                    <strong>Location:</strong> {meeting.location || "TBC"}
                  </p>
                </div>
                <div className="button-group">
                  <button
                    className="view-details-button"
                    onClick={() => openSendPopup(meeting)}
                  >
                    Send Poll
                  </button>
                  <button
                    className="edit-button"
                    onClick={() => openUpdatePopup(meeting)}
                  >
                    Finalise
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

          {/* See More / See Less Button */}
          {meetings.length > 3 && (
            <button
              className={`see-more-button ${
                showAllMeetings ? "see-less-button" : ""
              }`}
              onClick={() => setShowAllMeetings(!showAllMeetings)}
            >
              {showAllMeetings ? "See Less" : "See More"}
            </button>
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
          <FinaliseMeetingPopUp
            meetingId={currentMeeting.meetingId}
            meeting={currentMeeting}
            onClose={closeUpdatePopup}
          />
        )}

        {isSendPopupOpen && currentMeeting && (
          <SendDetailsPopUp
            meetingId={currentMeeting.meetingId}
            userId={profileId} // Replace with the logged-in user's ID
            onClose={closeSendPopup}
          />
        )}

        {/* Delete Confirmation Pop-Up */}
        {isDeletePopupOpen && (
          <DeleteMeetingPopUp
            meetingId={currentMeeting.meetingId}
            meetingName={currentMeeting.name}
            onClose={closeDeletePopup}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default UnfinalizedMeetings;