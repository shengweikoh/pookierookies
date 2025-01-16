import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../Components/Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import "./Calendar.css";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatMonthYear = (date) => {
    const options = { year: "numeric", month: "2-digit" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  // Memoized function to fetch events
  const fetchGoogleCalendarEvents = useCallback(
    async (monthYear) => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}calendar/events/`,
          {
            email: "kohshengwei@gmail.com",
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
        console.error("Error fetching Google Calendar events:", error);
      }
    },
    [] // No dependencies, function won't change
  );

  // Fetch initial events
  useEffect(() => {
    fetchGoogleCalendarEvents(formatMonthYear(currentDate));
  }, [fetchGoogleCalendarEvents, currentDate]); // Include all dependencies

  // Handle month navigation
  const handleDatesSet = (info) => {
    const newDate = new Date(info.start);
    setCurrentDate(newDate);
    fetchGoogleCalendarEvents(formatMonthYear(newDate));
  };

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