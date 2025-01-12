import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar"; // Import your existing sidebar
import "./ScheduleMeeting.css";
import EditPopUp from "../../pages/scheduling/Sub-pages/EditPopUp";

const ScheduleMeeting = () => {
    const [meetings, setMeetings] = useState([
      {
        id: 1,
        name: "Annual General Meeting",
        date: "Monday, Jan 15, 2025",
        time: "10:00 AM - 11:00 AM",
        location: "Room 101",
      },
      {
        id: 2,
        name: "Weekly Team Meeting",
        date: "Tuesday, Jan 16, 2025",
        time: "2:00 PM - 3:00 PM",
        location: "Zoom",
      },
      {
        id: 3,
        name: "UX Testing and Review",
        date: "Wednesday, Jan 17, 2025",
        time: "3:30 PM - 4:30 PM",
        location: "Room 202",
      },
    ]);
  
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentMeeting, setCurrentMeeting] = useState(null);
  
    const handleEditClick = (meeting) => {
      setCurrentMeeting(meeting); // Set the meeting to edit
      setIsPopupOpen(true); // Open the pop-up
    };
  
    const handleSaveChanges = (updatedMeeting) => {
      setMeetings((prevMeetings) =>
        prevMeetings.map((meeting) =>
          meeting.id === updatedMeeting.id ? updatedMeeting : meeting
        )
      );
      setIsPopupOpen(false); // Close the pop-up after saving
    };
  
    const handleCancelEdit = () => {
      setIsPopupOpen(false); // Close the pop-up without saving
    };
  
    return (
      <div className="schedule-meeting-container">
        <Sidebar />
        <div className="main-content">
          <div className="header">
            <h1 className="header-title">Upcoming Meetings</h1>
            <div className="header-buttons">
              <button className="button">Schedule Meeting</button>
              <button className="button">Send Reminder</button>
            </div>
          </div>
          <div className="upcoming-meetings">
            {meetings.map((meeting) => (
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
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(meeting)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="see-more-button">See More</button>
  
          {/* Show the Edit Meeting Pop-Up */}
          {isPopupOpen && (
            <EditPopUp
              meeting={currentMeeting}
              onSave={handleSaveChanges}
              onClose={handleCancelEdit}
            />
          )}
        </div>
      </div>
    );
  };
  
  export default ScheduleMeeting;