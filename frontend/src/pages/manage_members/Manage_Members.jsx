import React from "react";
import Sidebar from "../../Components/Sidebar";
import "./Manage_Members.css";

const ManageMembers = () => {
  return (
    <div className="manage-members-container">
      <Sidebar />
      <div className="main-content">
        <div className="header-container">
          <h1 className="header-title">Members</h1>
          <div className="header-actions">
            <input
              type="text"
              className="search-bar"
              placeholder="Search Members"
            />
            <select className="dropdown">
              <option value="">Groups</option>
              <option value="Group1">Group 1</option>
              <option value="Group2">Group 2</option>
            </select>
            <select className="dropdown">
              <option value="">Roles</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>
            <button className="normal-button">Manage Members</button>
          </div>
        </div>
        {/* Table */}
        <div className="table">
          <div className="table-header">
            <div className="table-column name-column">Name</div>
            <div className="table-column group-column">Group</div>
            <div className="table-column role-column">Role</div>
          </div>
          <div className="table-row">
            <div className="table-cell name-column">
              <div className="name-content">
                <div className="profile-photo"></div>
                <span>John Doe</span>
              </div>
            </div>
            <div className="table-cell group-column">Group 1</div>
            <div className="table-cell role-column">Admin</div>
          </div>
          <div className="table-row">
            <div className="table-cell name-column">
              <div className="name-content">
                <div className="profile-photo"></div>
                <span>Jane Smith</span>
              </div>
            </div>
            <div className="table-cell group-column">Group 2</div>
            <div className="table-cell role-column">Member</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMembers;