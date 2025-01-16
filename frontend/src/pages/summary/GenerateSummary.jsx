import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useCallback } from "react";
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

  const [user, setUser] = useState(null); // To store user details
  useEffect(() => {
    const auth = getAuth();
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is logged in
        console.log("User UID:", currentUser.uid);
        console.log("User Email:", currentUser.email);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
        });
      } else {
        // User is logged out
        console.log("No user is signed in.");
        setUser(null);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

// Step 1: Memoize fetchEmails
const fetchEmails = useCallback(
  async (token = "") => {
    if (!user?.email) return; // Ensure user.email exists
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}emails/get-all-emails/`,
        {
          user_id: user.email,
          page_token: token || "",
        }
      );

      const { emails: newEmails, next_page_token } = response.data;

      // Deduplicate emails based on ID
      const uniqueEmails = [
        ...emails,
        ...newEmails.filter(
          (newEmail) => !emails.some((existingEmail) => existingEmail.id === newEmail.id)
        ),
      ];

      setEmails(uniqueEmails);
      setFilteredEmails(uniqueEmails);
      setPageToken(next_page_token || "");
      setHasMore(!!next_page_token);

      console.log("Unique Email IDs:", uniqueEmails.map((email) => email.id));
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoading(false);
    }
  },
  [emails, user?.email] // Dependencies
);

// Step 2: Trigger fetchEmails on initial load when user.email exists
useEffect(() => {
  if (user?.email && pageToken === "") {
    // Only fetch emails on initial load
    fetchEmails();
  }
}, [user?.email, pageToken, fetchEmails]);

// Step 3: Handler for loading the next page
const handleLoadMore = () => {
  if (hasMore && !isLoading) {
    fetchEmails(pageToken); // Pass the current page token for the next page
  }
};

  // Step 2: Fetch email details (GET API)
  const fetchEmailDetails = async (emailId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}emails/get-email/`,
        {
          params: {
            user_id: user.email,
            email_id: emailId,
          },
        }
      );
      console.log("Fetched email details:", response.data);
      setEmailDetails(response.data.email); // Set the nested 'email' object
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
        {
          email: emailDetails,
        }
      );

      setSummary(response.data || "Summary not available.");
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
    const filtered = filteredEmails.filter((email) =>
      email.subject.toLowerCase().includes(query)
    );
    setFilteredEmails(filtered);
  }; 

  // Reset filteredEmails when searchQuery changes or clear search
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
              <button onClick={() => handleLoadMore(pageToken)} disabled={isLoading}>
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>

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
                  <strong>Recipients:</strong> {emailDetails.to || "N/A"}
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
                <h3>{summary.title}</h3>
                <p>{summary.body}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSummaryPage;