import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calendar.css";

const CalendarPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null); // For viewing details
  const events = [
    {
      id: 1,
      title: "Team Meeting",
      start: "2025-02-15T10:00:00",
      end: "2025-02-15T11:00:00",
      extendedProps: {
        type: "meeting",
        description: "Discuss project milestones.",
      },
    },
    {
      id: 2,
      title: "Submit Report",
      start: "2025-02-15T17:00:00",
      end: "2025-02-15T18:00:00",
      extendedProps: {
        type: "task",
        description: "Quarterly financial report submission.",
      },
    },
  ];

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  const closeDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-container">
      <Sidebar />
      <div className="main-content">
        <h1 className="header-title">Calendar</h1>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          height="auto"
        />

        {/* Event Details Pop-Up */}
        {selectedEvent && (
          <div className="event-details">
            <h2>{selectedEvent.title}</h2>
            <p>
              <strong>Type:</strong> {selectedEvent.extendedProps.type}
            </p>
            <p>
              <strong>Description:</strong> {selectedEvent.extendedProps.description}
            </p>
            <p>
              <strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}
            </p>
            <p>
              <strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}
            </p>
            <button onClick={closeDetails} className="close-button">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;