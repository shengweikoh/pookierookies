import React, { useState, useEffect } from "react";
import Sidebar from "../../../Components/Sidebar";
import CreateMeetingPopUp from "../../../pages/scheduling/Sub-pages/CreateMeetingPopUp";
import FinaliseMeetingPopUp from "../../../pages/scheduling/Sub-pages/FinaliseMeetingPopUp";
import SendDetailsPopUp from "../../../pages/scheduling/Sub-pages/SendDetailsPopUp";
import DeleteMeetingPopUp from "../../../pages/scheduling/Sub-pages/DeleteMeetingPopUp";
import ViewEditMeetingPopUp from "../../../pages/scheduling/Sub-pages/ViewEditMeetingPopUp"; // New import
import "./UnfinalisedMeetings.css";
import axios from "axios";
import { getLoggedInUserId } from "../../../Components/utils";

const formatDate = (isoDate) => {
  const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(isoDate).toLocaleString(undefined, options);
};

const UnfinalizedMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [isSendPopupOpen, setIsSendPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isViewEditPopupOpen, setIsViewEditPopupOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const profileId = getLoggedInUserId();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}meetings/list/${profileId}`);
        const unfinalizedMeetings = response.data.filter((meeting) => !meeting.finalized);
        setMeetings(unfinalizedMeetings);
        setFilteredMeetings(unfinalizedMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        alert("Failed to load meetings. Please try again.");
      }
    };
    fetchMeetings();
  }, [profileId]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = meetings.filter((meeting) =>
      meeting.name.toLowerCase().includes(value) ||
      meeting.agenda.toLowerCase().includes(value) ||
      meeting.location.toLowerCase().includes(value)
    );
    setFilteredMeetings(filtered);
  };

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

  const openViewEditPopup = (meeting) => {
    setCurrentMeeting(meeting);
    setIsViewEditPopupOpen(true);
  };
  const closeViewEditPopup = () => setIsViewEditPopupOpen(false);

  const openDeletePopup = (meeting) => {
    setCurrentMeeting(meeting);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => setIsDeletePopupOpen(false);

  const handleDeleteSuccess = () => {
    setMeetings((prev) => prev.filter((meeting) => meeting.meetingId !== currentMeeting.meetingId));
    setFilteredMeetings((prev) => prev.filter((meeting) => meeting.meetingId !== currentMeeting.meetingId));
  };

  return (
    <div className="schedule-meeting-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1 className="header-title">Unfinalised Meetings</h1>
          <div className="header-controls">
            <input
              type="text"
              className="search-bar"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="button" onClick={openCreatePopup}>
              Create New Meeting
            </button>
          </div>
        </div>

        <section className="upcoming-meetings">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => (
              <div key={meeting.meetingId} className="meeting-item">
                <div className="meeting-details">
                  <p className="meeting-name">{meeting.name}</p>
                  <p className="meeting-title">
                    <strong>Agenda:</strong> {meeting.agenda}
                  </p>
                  <p className="meeting-location">
                    <strong>Location:</strong> {meeting.location || "TBC"}
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
                </div>
                <div className="button-group">
                  <button
                    className="view-details-button"
                    onClick={() => openSendPopup(meeting)}
                  >
                    Send Poll
                  </button>
                  <button
                    className="view-details-button blue-button"
                    onClick={() => openViewEditPopup(meeting)}
                  >
                    View & Edit
                  </button>
                  <button
                    className="view-details-button"
                    style={{ backgroundColor: "#ffc107" }}
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
        </section>

        {/* Popups */}
        {isCreatePopupOpen && <CreateMeetingPopUp onClose={closeCreatePopup} />}
        {isUpdatePopupOpen && <FinaliseMeetingPopUp meeting={currentMeeting} onClose={closeUpdatePopup} />}
        {isSendPopupOpen && <SendDetailsPopUp meetingId={currentMeeting.meetingId} userId={profileId} onClose={closeSendPopup} />}
        {isViewEditPopupOpen && (<ViewEditMeetingPopUp meeting={currentMeeting} userId={profileId} onClose={closeViewEditPopup}/>)}
        {isDeletePopupOpen && <DeleteMeetingPopUp meetingId={currentMeeting.meetingId} meetingName={currentMeeting.name} onClose={closeDeletePopup} onDeleteSuccess={handleDeleteSuccess} />}
      </div>
    </div>
  );
};

export default UnfinalizedMeetings;