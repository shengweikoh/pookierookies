import React, { useEffect, useState } from "react";
import "./GlobalMeeting.css";
import "./Meetings.css";
import "./PopUps.css";
import "./Responsive.css";

const SendDetailsPopUp = ({ attendees, onClose, onSend }) => {
  const [mode, setMode] = useState("all"); // "all" or "manual"
  const [selectedRecipients, setSelectedRecipients] = useState(
    attendees.map((email) => ({ email, selected: true }))
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Close the pop-up on Esc key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const toggleRecipient = (email) => {
    setSelectedRecipients((prev) =>
      prev.map((recipient) =>
        recipient.email === email
          ? { ...recipient, selected: !recipient.selected }
          : recipient
      )
    );
  };

  const handleSend = () => {
    const recipientsToSend =
      mode === "all"
        ? attendees
        : selectedRecipients
            .filter((recipient) => recipient.selected)
            .map((recipient) => recipient.email);
    onSend(recipientsToSend);
    onClose();
  };

  const filteredRecipients = selectedRecipients.filter((recipient) =>
    recipient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2 className="popup-title">Send Meeting Details</h2>
        <p className="popup-description">Choose recipients:</p>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="dropdown"
        >
          <option value="all">Send to All</option>
          <option value="manual">Manually Select</option>
        </select>
        {mode === "manual" && (
          <>
            <input
              type="text"
              placeholder="Search recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
            <ul className="recipient-list">
              {filteredRecipients.map((recipient) => (
                <li key={recipient.email} className="recipient-item">
                  <label className="recipient-label">
                    <input
                      type="checkbox"
                      checked={recipient.selected}
                      onChange={() => toggleRecipient(recipient.email)}
                      className="recipient-checkbox"
                    />
                    {recipient.email}
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="popup-buttons">
          <button className="button" onClick={handleSend}>
            Send
          </button>
          <button className="button cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendDetailsPopUp;