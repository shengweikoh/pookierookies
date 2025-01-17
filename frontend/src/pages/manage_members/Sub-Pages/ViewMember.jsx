import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../../Components/Sidebar";
import EditMemberPopUp from "../PopUps/EditMember";
import DeleteConfirmPopUp from "../PopUps/DeleteMember";
import { getLoggedInUserId } from "../../../Components/utils";
import axios from "axios";
import "./ViewMember.css";

const MemberDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [member, setMember] = useState(location.state?.member || null);
  const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
  const [isDeletePopUpOpen, setIsDeletePopUpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!member);

  const profileId = getLoggedInUserId();

  useEffect(() => {
    if (!member?.id || !profileId) return;

    const fetchMemberDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}members/get/${profileId}/${member.id}`
        );
        if (response.data) {
          setMember(response.data);
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching member details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberDetails();
  }, [member?.id, profileId]);

  const handleUpdateMember = async (updatedMember) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}members/edit/${profileId}/${updatedMember.id}/`,
        updatedMember
      );
      if (response.status === 200) {
        setMember(response.data);
        console.log("Member updated:", response.data);
      } else {
        console.error("Failed to update member:", response);
      }
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="member-details-container">
        <Sidebar />
        <div className="main-content">
          <h1>Loading member details...</h1>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-details-container">
        <Sidebar />
        <div className="main-content">
          <h1>No member data found</h1>
          <button onClick={() => navigate("/tools/manage-people")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="member-details-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <h1>{member.name}</h1>
          </div>
          <div className="header-right">
            <button
              className="normal-button"
              onClick={() => setIsEditPopUpOpen(true)}
            >
              Edit Member
            </button>
            <button
              className="danger-button"
              onClick={() => setIsDeletePopUpOpen(true)}
            >
              Delete Member
            </button>
          </div>
        </div>
        <div className="member-info">
          <p>
            <strong>Email:</strong> {member.email || "N/A"}
          </p>
          <p>
            <strong>Group:</strong> {member.group || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {member.role || "N/A"}
          </p>
        </div>

        {/* Edit Member Pop-Up */}
        {isEditPopUpOpen && (
          <EditMemberPopUp
            member={member}
            onClose={() => setIsEditPopUpOpen(false)}
            onSubmit={(updatedMember) => {
              handleUpdateMember(updatedMember);
              setIsEditPopUpOpen(false);
            }}
          />
        )}

        {/* Delete Confirmation Pop-Up */}
        {isDeletePopUpOpen && (
          <DeleteConfirmPopUp
            member={member}
            onClose={() => setIsDeletePopUpOpen(false)}
            onConfirm={() => navigate("/tools/manage-people")} // Pass navigation to popup
          />
        )}
      </div>
    </div>
  );
};

export default MemberDetails;