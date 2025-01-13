import React, { useState } from "react";
import "./MemberPopUp.css";

const AddMemberPopUp = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !group || !role) {
      alert("All fields are required!");
      return;
    }
    onSubmit({ name, group, role });
    setName("");
    setGroup("");
    setRole("");
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Add Member</h2>
        <form onSubmit={handleSubmit}>
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
          <div className="popup-buttons">
            <button type="submit" className="button">Add</button>
            <button type="button" className="button cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberPopUp;