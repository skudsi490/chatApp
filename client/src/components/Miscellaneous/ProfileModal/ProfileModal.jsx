import { useState } from 'react';
import './ProfileModal.css'; // Ensure CSS is linked

const ProfileModal = ({ user, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);


  const displayName = user?.fullName || "No Name";
  const displayEmail = user?.emailAddress || "No Email Available";
  const displayPic = user?.profilePicture || "https://via.placeholder.com/150";

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {children ? (
        <span onClick={openModal} className="open-modal-trigger">{children}</span>
      ) : (
        <button onClick={openModal} className="view-profile-btn">View Profile</button>
      )}
      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={handleModalContentClick}>
            <div className="modal-header">
              <h2 className="modal-title">{displayName}</h2>
              <button onClick={closeModal} className="close-button" aria-label="Close modal">&times;</button>
            </div>
            <div className="modal-body">
              <img src={displayPic} alt={`Profile of ${displayName}`} className="profile-image"/>
              <p className="profile-email">Email: {displayEmail}</p>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="close-modal-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
