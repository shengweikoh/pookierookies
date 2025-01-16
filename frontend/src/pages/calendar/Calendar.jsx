import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../Components/Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import "./Calendar.css";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Utility function to format date and time
  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}tasks/1PMhHEtZCzemYz74ScOYvz6jNlQ2/`);
      return response.data.tasks.map((task) => ({
        id: task.taskId,
        title: task.name,
        start: task.dueDate,
        extendedProps: {
          description: task.description,
          priority: task.priority,
          status: task.status, // Represents progress
          assignedTo: task.assignedTo,
          group: task.group,
        },
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }, []);

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}meetings/list/`);
      return response.data
        .filter((meeting) => meeting.finalized) // Exclude unfinalized meetings
        .map((meeting) => {
          if (!meeting.finalized_date) {
            console.warn("Meeting skipped due to missing finalizedDate:", meeting);
            return null;
          }

          const startDate = new Date(meeting.finalized_date);
          const endDate = meeting.duration
            ? new Date(startDate.getTime() + meeting.duration * 60 * 60 * 1000)
            : null;

          return {
            id: meeting.meetingId,
            title: meeting.name,
            start: startDate.toISOString(),
            end: endDate ? endDate.toISOString() : undefined,
            extendedProps: {
              agenda: meeting.agenda || "No agenda provided",
              attendees: meeting.attendees || [],
              location: meeting.location || "No location provided",
              pollLink: meeting.poll_link,
            },
          };
        })
        .filter(Boolean); // Remove null entries
    } catch (error) {
      console.error("Error fetching meetings:", error);
      return [];
    }
  }, []);

  const fetchAllEvents = useCallback(async () => {
    try {
      const tasks = await fetchTasks();
      const meetings = await fetchMeetings();
      setEvents([...tasks, ...meetings]);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [fetchTasks, fetchMeetings]);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setPopupPosition({
      x: info.jsEvent.clientX,
      y: info.jsEvent.clientY,
    });
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-container">
      <Sidebar />
      <div className="main-content">
        <div className="calendar-header">
          <h1 className="header-title">Calendar</h1>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
        />

        {/* Custom Event Pop-Up */}
        {selectedEvent && (
          <div
            className="event-popup"
            style={{
              top: `${popupPosition.y}px`,
              left: `${popupPosition.x}px`,
            }}
          >
            <h5>{selectedEvent.title}</h5>
            {selectedEvent.extendedProps.description && (
              <p><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
            )}
            {selectedEvent.extendedProps.priority && (
              <p><strong>Priority:</strong> {selectedEvent.extendedProps.priority}</p>
            )}
            {selectedEvent.extendedProps.status && (
              <p><strong>Progress:</strong> {selectedEvent.extendedProps.status}</p>
            )}
            {selectedEvent.start && (
              <p><strong>Due Date:</strong> {formatDate(selectedEvent.start)}</p>
            )}
            <button onClick={closeEventDetails} className="popup-close-button">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;