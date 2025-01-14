import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import AddMemberPopUp from "./PopUps/AddMember";
import "./Manage_Members.css";

const ManageMembers = () => {
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "John Doe",
      group: "Group 1",
      role: "Admin",
      profilePhoto: null, // Can be updated with actual URLs
    },
    {
      id: 2,
      name: "Jane Smith",
      group: "Group 2",
      role: "Member",
      profilePhoto: null,
    },
    {
      id: 3,
      name: "Alice Johnson",
      group: "Group 1",
      role: "Member",
      profilePhoto: null,
    },
    {
      id: 4,
      name: "Bob Brown",
      group: "Group 2",
      role: "Admin",
      profilePhoto: null,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isAddPopUpOpen, setIsAddPopUpOpen] = useState(false);

  const navigate = useNavigate();

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup ? member.group === selectedGroup : true;
    const matchesRole = selectedRole ? member.role === selectedRole : true;
    return matchesSearch && matchesGroup && matchesRole;
  });

const handleAddMember = (newMembers) => {
  setMembers((prev) => [...prev, ...newMembers]); // Append multiple members for Quick Add
  setIsAddPopUpOpen(false);
};

  const handleRowClick = (member) => {
    navigate(`/tools/manage-people/${member.id}`, { state: { member } });
  };

  return (
    <div className="manage-members-container">
      <Sidebar />
      <div className="main-content">
        <div className="header-container">
          <h1 className="header-title">Contacts</h1>
          <button className="normal-button1" onClick={() => setIsAddPopUpOpen(true)}>
            Add Contact
          </button>
        </div>
        <div className="filters-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search Contact"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="dropdown"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Groups</option>
            <option value="Group 1">Group 1</option>
            <option value="Group 2">Group 2</option>
          </select>
          <select
            className="dropdown"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Roles</option>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
          </select>
        </div>
        <div className="table">
          <div className="table-header">
            <div className="table-column name-column">Name</div>
            <div className="table-column group-column">Group</div>
            <div className="table-column role-column">Role</div>
          </div>
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="table-row"
              onClick={() => handleRowClick(member)}
            >
              <div className="table-cell name-column">
                <div className="name-content">
                  <div
                    className="profile-photo"
                    style={{
                      backgroundImage: `url(${member.profilePhoto || "/default-photo.png"})`,
                    }}
                  ></div>
                  <span>{member.name}</span>
                </div>
              </div>
              <div className="table-cell group-column">{member.group}</div>
              <div className="table-cell role-column">{member.role}</div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <div className="table-row">
              <div className="table-cell" colSpan="3">
                No members found.
              </div>
            </div>
          )}
        </div>

        {isAddPopUpOpen && (
          <AddMemberPopUp
            onClose={() => setIsAddPopUpOpen(false)}
            onSubmit={handleAddMember}
          />
        )}
      </div>
    </div>
  );
};

export default ManageMembers;