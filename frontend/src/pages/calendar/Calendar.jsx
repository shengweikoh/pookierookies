import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../Components/Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import "./Calendar.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // State for the selected event
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const formatMonthYear = (date) => {
    return date.toISOString().slice(0, 7); // Extracts 'YYYY-MM' from the ISO string
  };

  const fetchGoogleCalendarEvents = useCallback(async (monthYear) => {
    if (!user) {
      console.warn("User is not authenticated.");
      return;
    }

    try {
      // Validate monthYear format
      if (!/^\d{4}-\d{2}$/.test(monthYear)) {
        console.error("Invalid monthYear format. Use 'YYYY-MM'.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}calendar/events/`,
        {
          email: user.email,
          monthYear: monthYear || "", // Default to current month
        }
      );

      const { events: fetchedEvents } = response.data;

      const formattedEvents = fetchedEvents.map((event) => {
        const [description, location] = event.description.split(" | Location: ");
        return {
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          extendedProps: {
            description,
            location: location || "No Location", // Default to "No Location" if not found
          },
        };
      });

      // Replace events with those for the current date range
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error.response?.data || error.message);
    }
  }, [user]);

  // Fetch events on component load or user change
  useEffect(() => {
    if (user) {
      fetchGoogleCalendarEvents(formatMonthYear(currentDate));
    }
  }, [fetchGoogleCalendarEvents, currentDate, user]);

  // Handle month navigation
  const handleDatesSet = (info) => {
    setEvents([]);
    const newDate = new Date(info.start);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
    fetchGoogleCalendarEvents(formatMonthYear(newDate)); // Fetch events for the new month
  };

  // Handle event click
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      description: event.extendedProps.description,
      location: event.extendedProps.location, // Add location here
    });
    setIsPopupOpen(true);
  };

  // Close the popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedEvent(null);
  };

  if (!user) {
    return <div>Please log in to view the calendar.</div>;
  }

  return (
    <div className="calendar-container">
      <Sidebar />
      <div className="main-content">
        <div className="calendar-header">
          <h1 className="header-title">Calendar</h1>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          datesSet={handleDatesSet} // Triggered when the user navigates months
          eventClick={handleEventClick} // Triggered when an event is clicked
          headerToolbar={{
            start: "prev,next",
            center: "title",
            end: "",
          }}
          height="auto"
        />

        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>{selectedEvent.title}</h2>
              <p><strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p> {/* Display location separately */}
              <button onClick={handleClosePopup}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
