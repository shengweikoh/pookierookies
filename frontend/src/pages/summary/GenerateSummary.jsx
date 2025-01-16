import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import "./GenerateSummary.css";
import axios from "axios";

const EmailSummaryPage = () => {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailDetails, setEmailDetails] = useState(null);
  const [summary, setSummary] = useState("");
  const [pageToken, setPageToken] = useState(""); // Pagination token
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Flag to check if more pages are available

  const userId = "kohshengwei@gmail.com"; // Replace with dynamic user retrieval if available

  // Step 1: Fetch emails (POST API)
  const fetchEmails = async (token = "") => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}emails/get-all-emails/`,
        {
          user_id: userId,
          page_token: token || "",
        }
      );

      const { emails: newEmails, next_page_token } = response.data;
      setEmails((prevEmails) => [...prevEmails, ...newEmails]);
      setFilteredEmails((prevEmails) => [...prevEmails, ...newEmails]);
      setPageToken(next_page_token || "");
      setHasMore(!!next_page_token); // Set hasMore based on next_page_token
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch emails on initial load
  useEffect(() => {
    fetchEmails();
  }, []);

  // Step 2: Fetch email details (GET API)
  const fetchEmailDetails = async (emailId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}emails/get-email/`,
        {
          params: {
            user_id: userId,
            email_id: emailId,
          },
        }
      );
      setEmailDetails(response.data);
    } catch (error) {
      console.error("Error fetching email details:", error);
      setEmailDetails(null);
    }
  };

  // Step 3: Generate summary (POST API)
  const handleGenerateSummary = async () => {
    if (!emailDetails) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}emails/summarize-email/`,
        {
          email: emailDetails,
        }
      );
      setSummary(response.data.summary || "Summary not available.");
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Failed to generate summary. Please try again.");
    }
  };

  // Handle email selection
  const handleSelectEmail = (email) => {
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(null); // Deselect email
      setEmailDetails(null);
      setSummary("");
    } else {
      setSelectedEmail(email);
      fetchEmailDetails(email.id); // Fetch full details for the selected email
      setSummary(""); // Reset summary
    }
  };

  // Handle search filtering
  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(query) ||
        email.sender.toLowerCase().includes(query)
    );
    setFilteredEmails(filtered);
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
          {/* Email List */}
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
            {hasMore && (
              <button onClick={() => fetchEmails(pageToken)} disabled={isLoading}>
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>

          {/* Email Details */}
          <div className="email-details">
            {emailDetails ? (
              <>
                <h2>Email Details</h2>
                <p>
                  <strong>Subject:</strong> {emailDetails.subject}
                </p>
                <p>
                  <strong>Sender:</strong> {emailDetails.from}
                </p>
                <p>
                  <strong>Recipients:</strong>{" "}
                  {emailDetails.to?.join(", ") || "N/A"}
                </p>
                <p>
                  <strong>Body:</strong> {emailDetails.body}
                </p>
                <button onClick={handleGenerateSummary}>Generate Summary</button>
              </>
            ) : (
              <p>Select an email to view details.</p>
            )}
          </div>

          {/* Generated Summary */}
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