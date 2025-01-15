import React, { useState, useEffect, useCallback } from "react";
import "./MemberPopUp.css";
import axios from "axios";

const EditMemberPopUp = ({ member, onClose, onSubmit }) => {
  const [name, setName] = useState(member.name || "");
  const [email, setEmail] = useState(member.email || "");
  const [group, setGroup] = useState(member.group || "");
  const [role, setRole] = useState(member.role || "");

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault(); // Ensure the event is prevented only when it's provided

      try {
        const updatedMember = {
          id: member.id,
          name,
          email,
          group,
          role,
        };

        // Update member in the backend
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_BASE_URL}members/edit/${member.id}`,
          updatedMember
        );

        if (response.status === 200) {
          console.log("Member updated successfully:", response.data);
          onSubmit(response.data); // Pass the updated member data back to the parent
          onClose(); // Close the popup
        } else {
          console.error("Failed to update member");
        }
      } catch (error) {
        console.error("Error updating member:", error);
      }
    },
    [member.id, name, email, group, role, onClose, onSubmit]
  );

  // Event listener for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Enter") {
        handleSubmit(e); // Call the submit function when Enter is pressed
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSubmit, onClose]); // Dependency array updated to include handleSubmit and onClose

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
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Group:
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            />
          </label>
          <label>
            Role:
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </label>
          <div className="popup-buttons">
            <button type="submit" className="button">
              Save
            </button>
            <button
              type="button"
              className="button cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberPopUp;