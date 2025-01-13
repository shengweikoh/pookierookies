import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar";
import "./GenerateSummary.css";

// Mock data for email threads
const mockData = [
  {
    id: 1,
    subject: "Project Kickoff Meeting Notes",
    sender: "manager@example.com",
    recipients: ["team@example.com", "stakeholder@example.com"],
    date: "2025-01-12T10:00:00Z",
    body: "Here are the notes from our kickoff meeting...",
    thread: [
      {
        id: "1-1",
        sender: "team@example.com",
        date: "2025-01-12T11:00:00Z",
        body: "Thanks for the notes! I have a few questions...",
      },
      {
        id: "1-2",
        sender: "stakeholder@example.com",
        date: "2025-01-12T11:30:00Z",
        body: "Can we schedule a follow-up meeting next week?",
      },
    ],
  },
  {
    id: 2,
    subject: "Budget Discussion Follow-Up",
    sender: "finance@example.com",
    recipients: ["manager@example.com"],
    date: "2025-01-11T15:00:00Z",
    body: "Following up on the budget discussion...",
    thread: [],
  },
];

const EmailSummaryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmails, setFilteredEmails] = useState(mockData);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [summary, setSummary] = useState("");

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = mockData.filter(
      (email) =>
        email.subject.toLowerCase().includes(query) ||
        email.sender.toLowerCase().includes(query)
    );
    setFilteredEmails(filtered);
  };

  const handleSelectEmail = (email) => {
    if (selectedEmail?.id === email.id) {
      // Unselect the email if it is already selected
      setSelectedEmail(null);
      setSummary(""); // Reset summary when deselecting an email
    } else {
      // Select the email
      setSelectedEmail(email);
      setSummary(""); // Reset summary when selecting a new email
    }
  };

  const handleGenerateSummary = () => {
    // Mock summary generation
    setSummary(
      "This is a summary of the email thread. Key points: Meeting notes, follow-up required."
    );
  };

  return (
    <div className="email-summary-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1 className="header-title">Generate Email Summaries</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search emails by subject or sender"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>

        <div className="content">
          <div className="email-list">
            <h2>Email Threads</h2>
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`email-item ${
                    selectedEmail?.id === email.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectEmail(email)}
                >
                  <p>
                    <strong>{email.subject}</strong>
                  </p>
                  <p>{email.sender}</p>
                  <p>{new Date(email.date).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p>No emails found.</p>
            )}
          </div>
                
          <div className="email-details">
            {selectedEmail ? (
              <>
                <h2>Email Details</h2>
                <p>
                  <strong>Subject:</strong> {selectedEmail.subject}
                </p>
                <p>
                  <strong>Sender:</strong> {selectedEmail.sender}
                </p>
                <p>
                  <strong>Recipients:</strong>{" "}
                  {selectedEmail.recipients.join(", ")}
                </p>
                <p>
                  <strong>Body:</strong> {selectedEmail.body}
                </p>
                {selectedEmail.thread.length > 0 && (
                  <>
                    <h3>Thread</h3>
                    <ul>
                      {selectedEmail.thread.map((thread) => (
                        <li key={thread.id}>
                          <p>
                            <strong>{thread.sender}</strong>: {thread.body}
                          </p>
                          <p>{new Date(thread.date).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button onClick={handleGenerateSummary}>Generate Summary</button>
              </>
            ) : (
              <p>Select an email to view details.</p>
            )}
          </div>

          {/* Divider */}
        {/* <hr className="divider" /> */}

          <div className="summary-section">
            {summary && (
              <>
                <h2>Generated Summary</h2>
                <p>{summary}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSummaryPage;