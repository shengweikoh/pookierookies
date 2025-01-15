import React, { useState } from "react";
import "./MemberPopUp.css";
import { getLoggedInUserId } from "../../../Components/utils";

const EditMemberPopUp = ({ member, onClose, onSubmit }) => {
  const [name, setName] = useState(member.name || "");
  const [email, setEmail] = useState(member.email || "");
  const [group, setGroup] = useState(member.group || "");
  const [role, setRole] = useState(member.role || "");
  const [profilePhoto, setProfilePhoto] = useState(member.profilePhoto || null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result); // Store the photo preview as a Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: member.id,
      name,
      email,
      group,
      role,
      profilePhoto,
    });
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
          <label>
            Profile Photo:
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </label>
          {profilePhoto && (
            <div className="photo-preview">
              <img src={profilePhoto} alt="Profile Preview" />
            </div>
          )}
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