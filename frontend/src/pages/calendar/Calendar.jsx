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
          monthYear: monthYear || formatMonthYear(new Date()), // Default to current month
        }
      );

      const { events: fetchedEvents } = response.data;

      const formattedEvents = fetchedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        extendedProps: {
          description: event.description,
        },
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error.response?.data || error.message);
    }
  }, [user]);

  // Fetch initial events
  useEffect(() => {
    if (user) {
      fetchGoogleCalendarEvents(formatMonthYear(currentDate));
    }
  }, [fetchGoogleCalendarEvents, currentDate, user]);

  // Handle month navigation
  const handleDatesSet = (info) => {
    const newDate = new Date(info.start);
    setCurrentDate(newDate);
    fetchGoogleCalendarEvents(formatMonthYear(newDate));
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
          datesSet={handleDatesSet} // Triggered when month changes
          headerToolbar={{
            start: "prev,next",
            center: "title",
            end: "",
          }}
          height="auto"
        />
      </div>
    </div>
  );
};

export default CalendarPage;