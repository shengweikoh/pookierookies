import React, { useState } from "react";
import "./MemberPopUp.css";

const AddMemberPopUp = ({ onClose, onSubmit }) => {
  const [isQuickAdd, setIsQuickAdd] = useState(false); // Toggle for Quick Add view
  const [group, setGroup] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // State to manage success message visibility

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
      setIsSuccess(true); // Show success message
      setName("");
      setEmail("");
      setGroup("");
      setRole("");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{isQuickAdd ? "Quick Add Contacts" : "Add Contact"}</h2>
        {isSuccess && (
          <div className="success-message">
            Member added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Common Group and Role Inputs */}
          <label>
            Group:
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
              placeholder="Enter Group Name"
            />
          </label>
          <label>
            Role:
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Head">Head of the group</option>
              <option value="Member">Member of the group</option>
            </select>
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
                  placeholder="Enter Name"
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter Email"
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Input Names and Emails in this format:
                <textarea
                  placeholder="John, John@gmail.com; Joe, Joe@gmail.com;"
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
              {isQuickAdd ? "Quick Add" : "Add Contact"}
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