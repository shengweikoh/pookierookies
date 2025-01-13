import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import "./ScheduleMeeting.css";
import EditPopUp from "./Sub-pages/UpdateMeetingPopUp";
import SendReminderPopUp from "./Sub-pages/SendReminderPopUp";
import ViewDetailsPopUp from "./Sub-pages/ViewDetailsPopUp";

const ScheduleMeeting = () => {
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      name: "Annual General Meeting",
      date: "Monday, Jan 15, 2025",
      time: "10:00 AM - 11:00 AM",
      location: "Room 101",
      attendees: ["john@example.com", "jane@example.com"],
      agenda: "Discuss company goals and progress.",
    },
    {
      id: 2,
      name: "Weekly Team Meeting",
      date: "Tuesday, Jan 16, 2025",
      time: "2:00 PM - 3:00 PM",
      location: "Zoom",
      attendees: ["john@example.com", "jane@example.com"],
      agenda: "Discuss company goals and progress.",
    },
    {
      id: 3,
      name: "UX Testing and Review",
      date: "Wednesday, Jan 17, 2025",
      time: "3:30 PM - 4:30 PM",
      location: "Room 202",
      attendees: ["john@example.com", "jane@example.com"],
      agenda: "Discuss company goals and progress.",
    },
    {
      id: 4,
      name: "Client Onboarding Session",
      date: "Thursday, Jan 18, 2025",
      time: "1:00 PM - 2:00 PM",
      location: "Room 303",
      attendees: ["john@example.com", "jane@example.com"],
      agenda: "Discuss company goals and progress.",
    },
    {
      id: 5,
      name: "Project Planning Workshop",
      date: "Friday, Jan 19, 2025",
      time: "10:00 AM - 12:00 PM",
      location: "Zoom",
      attendees: ["john@example.com", "jane@example.com"],
      agenda: "Discuss company goals and progress.",
    },
  ]);

  const [visibleCount, setVisibleCount] = useState(3); // Number of meetings to display initially
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);
  const [isViewDetailsPopupOpen, setIsViewDetailsPopupOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);

  const handleEditClick = (meeting) => {
    setCurrentMeeting(meeting);
    setIsPopupOpen(true);
  };

  const handleViewDetailsClick = (meeting) => {
    setCurrentMeeting(meeting);
    setIsViewDetailsPopupOpen(true);
  };

  const handleSaveChanges = (updatedMeeting) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((meeting) =>
        meeting.id === updatedMeeting.id ? updatedMeeting : meeting
      )
    );
    setIsPopupOpen(false);
  };

  const handleCancelEdit = () => {
    setIsPopupOpen(false);
  };

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 3); // Increment the number of visible meetings by 3
  };

  const handleShowLess = () => {
    setVisibleCount(3); // Reset the visible meetings count to 3
  };

  const openReminderPopup = () => {
    setIsReminderPopupOpen(true);
  };

  const closeReminderPopup = () => {
    setIsReminderPopupOpen(false);
  };

  return (
    <div className="schedule-meeting-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1 className="header-title">Upcoming Meetings</h1>
          <div className="header-buttons">
            <button className="button">
              <Link to="unfinalised-meetings" className="button">
                Schedule Meeting
              </Link>
            </button>
            <button className="button" onClick={openReminderPopup}>
              Send Reminder
            </button>
          </div>
        </div>
        <div className="upcoming-meetings">
          {meetings.slice(0, visibleCount).map((meeting) => (
            <div className="meeting-item" key={meeting.id}>
              <div className="meeting-details">
                <p className="meeting-date">{meeting.date}</p>
                <div className="meeting-time-location">
                  <div>
                    <p className="meeting-name">
                      <strong>{meeting.name}</strong>
                    </p>
                    <p className="meeting-title">{meeting.time}</p>
                    <p className="meeting-location">Space: {meeting.location}</p>
                  </div>
                  <div className="button-group">
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(meeting)}
                    >
                      Edit
                    </button>
                    <button
                      className="view-details-button"
                      onClick={() => handleViewDetailsClick(meeting)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="button-container">
          {visibleCount < meetings.length && (
            <button className="see-more-button" onClick={handleSeeMore}>
              See More
            </button>
          )}
          {visibleCount > 3 && (
            <button className="see-less-button" onClick={handleShowLess}>
              See Less
            </button>
          )}
        </div>

        {/* Show the Edit Meeting Pop-Up */}
        {isPopupOpen && (
          <EditPopUp
            meeting={currentMeeting}
            onSave={handleSaveChanges}
            onClose={handleCancelEdit}
          />
        )}

        {/* Show the Send Reminder Pop-Up */}
        {isReminderPopupOpen && (
          <SendReminderPopUp meetings={meetings} onClose={closeReminderPopup} />
        )}

        {/* View Details Pop-Up */}
        {isViewDetailsPopupOpen && (
          <ViewDetailsPopUp
            meeting={currentMeeting}
            onClose={() => setIsViewDetailsPopupOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleMeeting;