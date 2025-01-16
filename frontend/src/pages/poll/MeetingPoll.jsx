import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./MeetingPoll.css";


const PollPage = () => {
    const { id } = useParams();
    const [meetingDetails, setMeetingDetails] = useState(null);
    const [email, setEmail] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchMeetingDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}meetings/${id}/`);
                setMeetingDetails(response.data);
            } catch (err) {
                console.error("Error fetching meeting details:", err);
                setError("Failed to fetch meeting details. Please try again later.");
            }
        };

        fetchMeetingDetails();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !selectedDate) {
            setError("Please provide your email and select a date.");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}meetings/submit-response/`, {
                id,
                email,
                selectedDate,
            });
            if (response.status === 200) {
                setSuccess("Your response has been submitted successfully!");
                setError("");
            }
        } catch (err) {
            console.error("Error submitting poll response:", err);
            setError("Failed to submit your response. Please try again later.");
        }
    };

    if (!meetingDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="poll-container">
            <h1 className="header-title">{meetingDetails.name}</h1>
            <p className="meeting-details"><strong><span className="detail-title">Agenda:</span></strong> <span className="detail-text">{meetingDetails.agenda}</span></p>
            <p className="meeting-details"><strong><span className="detail-title">Poll Deadline:</span></strong> <span className="detail-text">{new Date(meetingDetails.poll_deadline).toLocaleString()}</span></p>
            <p className="meeting-details"><strong><span className="detail-title">Location:</span></strong> <span className="detail-text">{meetingDetails.location || "TBD"}</span></p>
            {/* <p className="meeting-details"><strong>Proposed Dates:</strong>
                <ul>
                    {meetingDetails.proposed_dates.map((date) => (
                        <li key={date}>{new Date(date).toLocaleString()}</li>
                    ))}
                </ul>
            </p> */}
            <form className="poll-form" onSubmit={handleSubmit}>
                <label>Email Address:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Select a Date:</label>
                <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                >
                    <option value="">-- Choose a date --</option>
                    {meetingDetails.proposed_dates.map((date) => (
                        <option key={date} value={date}>
                            {new Date(date).toLocaleString()}
                        </option>
                    ))}
                </select>
                <br />
                <button type="submit">Submit Poll</button>
            </form>

            {error && <p className="poll-message error">{error}</p>}
            {success && <p className="poll-message success">{success}</p>}
        </div>
    );
};

export default PollPage;
