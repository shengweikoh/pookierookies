import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import "./ScheduleMeeting.css";
import EditPopUp from "./Sub-pages/UpdateMeetingPopUp";
import SendReminderPopUp from "./Sub-pages/SendReminderPopUp";
import ViewDetailsPopUp from "./Sub-pages/ViewDetailsPopUp";
import axios from "axios";

const ScheduleMeeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3); // Initial number of meetings to display
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);
  const [isViewDetailsPopupOpen, setIsViewDetailsPopupOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper functions
  const formatDate = (isoDate) => {
    const dateObj = new Date(isoDate);
    const options = { weekday: "long", month: "short", day: "numeric", year: "numeric" };
    return dateObj.toLocaleDateString("en-US", options); // Example: "Monday, Jan 15, 2025"
  };

  const formatTime = (isoDate, duration) => {
    const startDate = new Date(isoDate);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + duration);

    const format = (date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert 0 or 24 to 12
      return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    };

    return `${format(startDate)} - ${format(endDate)}`; // Example: "10:00 AM - 11:00 AM"
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}meetings/list/`);
        if (response.data && Array.isArray(response.data)) {
          const formattedMeetings = response.data.map((meeting) => ({
            meetingId: meeting.meetingId,
            name: meeting.name,
            date: formatDate(meeting.finalized_date),
            time: formatTime(meeting.finalized_date, meeting.duration || 1), // Adjusting for duration
            location: meeting.location,
            attendees: meeting.attendees.map((attendee) => attendee.email),
            agenda: meeting.agenda,
          }));
          setMeetings(formattedMeetings);
        } else {
          console.error("Unexpected data format:", response.data);
        }
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleEditClick = (meeting) => {
    setCurrentMeeting(meeting);
    setIsPopupOpen(true);
  };

  const handleViewDetailsClick = (meeting) => {
    setCurrentMeeting(meeting);
    setIsViewDetailsPopupOpen(true);
  };

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const handleShowLess = () => {
    setVisibleCount(3);
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
              <Link to="unfinalised-meetings">
                Schedule Meeting
              </Link>
            </button>
            <button className="button" onClick={openReminderPopup}>
              Send Reminder
            </button>
          </div>
        </div>
        {isLoading ? (
          <p>Loading meetings...</p>
        ) : (
          <>
            <div className="upcoming-meetings">
              {meetings.slice(0, visibleCount).map((meeting) => (
                <div className="meeting-item" key={meeting.meetingId}>
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
          </>
        )}

        {/* Show the Edit Meeting Pop-Up */}
        {isPopupOpen && (
          <EditPopUp
            meeting={currentMeeting}
            onSave={(updatedMeeting) =>
              setMeetings((prevMeetings) =>
                prevMeetings.map((m) =>
                  m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
                )
              )
            }
            onClose={() => setIsPopupOpen(false)}
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