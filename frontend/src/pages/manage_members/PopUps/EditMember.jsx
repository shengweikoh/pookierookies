import React, { useState } from "react";
import "./MemberPopUp.css";

const EditMemberPopUp = ({ member, onClose, onSubmit }) => {
  const [name, setName] = useState(member.name);
  const [group, setGroup] = useState(member.group);
  const [role, setRole] = useState(member.role);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ id: member.id, name, group, role });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Edit Member</h2>
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
            <button type="submit" className="button">Save</button>
            <button type="button" className="button cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberPopUp;