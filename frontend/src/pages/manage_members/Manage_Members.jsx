import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import AddMemberPopUp from "./PopUps/AddMember";
import "./Manage_Members.css";
import axios from "axios";
import { getLoggedInUserId } from "../../Components/utils";

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isAddPopUpOpen, setIsAddPopUpOpen] = useState(false);

  const navigate = useNavigate();

  const profileId = getLoggedInUserId();
  

  // Fetch members from the backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}members/all-members/${profileId}`);
        if (response.data && Array.isArray(response.data.members)) {
          setMembers(response.data.members);
        } else {
          console.error("Unexpected data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsLoading(false); // Stop loading once the fetch is complete
      }
    };

    fetchMembers();
  }, []);

  // Filter members
  const filteredMembers = Array.isArray(members)
    ? members.filter((member) => {
        const matchesSearch = searchQuery
          ? member.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        const matchesGroup =
          selectedGroup && selectedGroup !== "All Groups"
            ? member.group === selectedGroup
            : true;
        const matchesRole =
          selectedRole && selectedRole !== "All Roles"
            ? member.role === selectedRole
            : true;
        return matchesSearch && matchesGroup && matchesRole;
      })
    : [];

  // Add member to the backend
  const handleAddMember = async (newMembers) => {
    try {
      // Make sure each new member is posted to the backend
      const responses = await Promise.all(
        newMembers.map((newMember) => {
          const memberData = { ...newMember, profileId };
          return axios.post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}members/create/`,
            memberData
          );
        })
      );
      console.log(responses); // Inspect the backend response to verify the presence of `id`.

      
      // Assuming that the response from the backend contains the full member object including 'id'
      const addedMembers = responses.map((res) => res.data.member);
      
      // Immediately update state with the new member information
      setMembers((prev) => [...prev, ...addedMembers]);
  
      setIsAddPopUpOpen(false); // Close popup after adding members
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };
  

  // Handle row click
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

        {/* Filters Section */}
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
            <option value="">All Groups</option>
            {Array.from(new Set(members.map((member) => member.group)))
              .filter((group) => group)
              .map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
          </select>
          <select
            className="dropdown"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {Array.from(new Set(members.map((member) => member.role)))
              .filter((role) => role)
              .map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
          </select>
        </div>

        {/* Table Section */}
        {isLoading ? (
          <p>Loading members...</p>
        ) : (
          <div className="table">
            <div className="table-header">
              <div className="table-column name-column">Name</div>
              <div className="table-column group-column">Group</div>
              <div className="table-column role-column">Role</div>
            </div>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
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
              ))
            ) : (
              <p>No members found.</p>
            )}
          </div>
        )}

        {/* Add Member Popup */}
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