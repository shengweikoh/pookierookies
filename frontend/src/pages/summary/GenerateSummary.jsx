import React, { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
  const [pageToken, setPageToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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

  const fetchEmails = useCallback(
    async (token = "") => {
      if (!user?.email) return;
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}emails/get-all-emails/`,
          { user_id: user.email, page_token: token || "" }
        );
        const { emails: newEmails, next_page_token } = response.data;
        const uniqueEmails = [
          ...emails,
          ...newEmails.filter(
            (newEmail) =>
              !emails.some((existingEmail) => existingEmail.id === newEmail.id)
          ),
        ];
        setEmails(uniqueEmails);
        setFilteredEmails(uniqueEmails);
        setPageToken(next_page_token || "");
        setHasMore(!!next_page_token);
      } catch (error) {
        console.error("Error fetching emails:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [emails, user?.email]
  );

  useEffect(() => {
    if (user?.email && pageToken === "") {
      fetchEmails();
    }
  }, [user?.email, pageToken, fetchEmails]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchEmails(pageToken);
    }
  };

  const fetchEmailDetails = async (emailId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}emails/get-email/`,
        {
          params: { user_id: user.email, email_id: emailId },
        }
      );
      setEmailDetails(response.data.email);
    } catch (error) {
      console.error("Error fetching email details:", error);
      setEmailDetails(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!emailDetails) return;
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}emails/summarize-email/`,
        { email: emailDetails }
      );
      setSummary(response.data || "Summary not available.");
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Failed to generate summary. Please try again.");
    }
  };

  const handleSelectEmail = (email) => {
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(null);
      setEmailDetails(null);
      setSummary("");
    } else {
      setSelectedEmail(email);
      fetchEmailDetails(email.id);
      setSummary("");
    }
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = emails.filter((email) =>
      email.subject.toLowerCase().includes(query)
    );
    setFilteredEmails(filtered);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredEmails(emails);
    }
  }, [searchQuery, emails]);

  return (
    <div className="email-summary-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1 className="header-title">Generate Email Summaries</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search emails by subject"
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
            {hasMore && (
              <button onClick={handleLoadMore} disabled={isLoading}>
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
          <div className="details-and-summary">
            {emailDetails ? (
              <div className="email-details">
                <h2>Email Details</h2>
                <p>
                  <strong>Subject:</strong> {emailDetails.subject}
                </p>
                <p>
                  <strong>Sender:</strong> {emailDetails.from}
                </p>
                <p>
                  <strong>Recipients:</strong> {emailDetails.to || "N/A"}
                </p>
                <p>
                  <strong>Body:</strong>{" "}
                  {emailDetails.body
                    ? `${emailDetails.body.slice(0, 200)}...`
                    : "N/A"}
                </p>
                <button onClick={handleGenerateSummary}>Generate Summary</button>
              </div>
            ) : (
              <p>Select an email to view details.</p>
            )}
            {summary && (
              <div className="summary-section">
                <h2>Generated Summary</h2>
                <h3>{summary.title}</h3>
                <p>{summary.body}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSummaryPage;