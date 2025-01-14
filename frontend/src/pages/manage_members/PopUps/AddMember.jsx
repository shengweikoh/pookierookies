import React, { useState } from "react";
import "./MemberPopUp.css";

const AddMemberPopUp = ({ onClose, onSubmit }) => {
  const [isQuickAdd, setIsQuickAdd] = useState(false); // Toggle for Quick Add view
  const [group, setGroup] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bulkInput, setBulkInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isQuickAdd) {
      // Handle Quick Add
      if (!group || !role || !bulkInput.trim()) {
        alert("Please fill in all fields for Quick Add!");
        return;
      }

      const members = bulkInput
        .split(";") // Split input by semicolon
        .map((entry) => entry.trim())
        .filter((entry) => entry) // Remove empty entries
        .map((entry) => {
          const [name, email] = entry.split(",").map((item) => item.trim());
          return { name, email, group, role, profilePhoto: null }; // Assuming no photos for bulk add
        });

      if (members.some((member) => !member.name || !member.email)) {
        alert(
          "Ensure all entries follow the format: Name, Email; (e.g., John, john@example.com;)"
        );
        return;
      }

      onSubmit(members); // Pass all parsed members
      setGroup("");
      setRole("");
      setBulkInput("");
    } else {
      // Handle Standard Add
      if (!name || !email || !group || !role) {
        alert("All fields are required!");
        return;
      }
      onSubmit([{ name, email, group, role, profilePhoto: null }]);
      setName("");
      setEmail("");
      setGroup("");
      setRole("");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{isQuickAdd ? "Quick Add Members" : "Add Member"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Common Group and Role Inputs */}
          <label>
            Group:
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
            />
          </label>
          <label>
            Role:
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </label>

          {/* Conditional Inputs */}
          {!isQuickAdd ? (
            <>
              <label>
                Name:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Input Names and Emails in this format:
                <textarea
                  placeholder="Ryan, ryanandskygt@gmail.com; Joe, joe@gmail.com;"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  rows={5}
                  required
                ></textarea>
              </label>
            </>
          )}

          {/* Buttons */}
          <div className="popup-buttons">
            <button type="submit" className="button">
              {isQuickAdd ? "Quick Add" : "Add Member"}
            </button>
            <button
              type="button"
              className="button cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button quick-add-button"
              onClick={() => setIsQuickAdd((prev) => !prev)}
            >
              {isQuickAdd ? "Switch to Standard Add" : "Switch to Quick Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberPopUp;