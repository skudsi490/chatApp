import './ListItem.css'; 

const ListItem = ({ user, handleFunction }) => {
  if (!user) {
    throw new Error("ListItem component expects a user object with 'fullName', 'profilePicture', and 'emailAddress' properties");
  }

  return (
    <div className="list-item-container" onClick={handleFunction} role="button" aria-label={`Select ${user.fullName}`}>
      <img className="avatar" src={user.profilePicture} alt={`${user.fullName}'s profile picture`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
      <div>
        <div className="text-main">{user.fullName}</div>
        <div className="text-email">Email: {user.emailAddress}</div>
      </div>
    </div>
  );
};

export default ListItem;
