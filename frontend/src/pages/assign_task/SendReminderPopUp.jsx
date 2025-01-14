import React, { useState } from "react";
import "./SendReminderPopUp.css"; // Add custom styles for the popup

const SendReminderPopup = ({ onClose, selectedTasks }) => {
  const [daysBefore, setDaysBefore] = useState("");
  const [date, setDate] = useState("");

  const handleSendNow = () => {
    // add backend linking logic here
    alert(`Send reminders now for tasks: ${selectedTasks.join(", ")}`);
    onClose();
  };

  const handleConfirm = () => {
    // add backend linking here 
    if (!daysBefore && !date) {
      alert("Please provide either 'X days before' or a specific date.");
      return;
    }
    console.log("Send reminders with the following details:");
    console.log("Tasks:", selectedTasks);
    console.log("Days Before:", daysBefore);
    console.log("Date:", date);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Send Reminders</h2>
        <div className="popup-field">
          <label>When: </label>
          <input
            type="number"
            placeholder="X days before due date"
            value={daysBefore}
            onChange={(e) => setDaysBefore(e.target.value)}
          />
        </div>
        <div className="popup-field">
          <label>Date: </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button className="send-now-button" onClick={handleSendNow}>
          Send Now
        </button>
        <div className="popup-footer">
          <button className="confirm-button" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendReminderPopup;
