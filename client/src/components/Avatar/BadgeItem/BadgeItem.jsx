import './BadgeItem.css'; 

const BadgeItem = ({ user, handleFunction, admin }) => {
  if (!user) {
    throw new Error("BadgeItem component expects a user object with 'fullName', 'profilePicture', and 'emailAddress' properties");
  }

  return (
    <div className="badge-item" onClick={handleFunction} role="button" aria-label={`Remove ${user.fullName}`}>
      {user.fullName}
      {admin === user._id && <span> (Admin)</span>}
      <svg className="badge-close-icon" viewBox="0 0 365.696 365.696" xmlns="http://www.w3.org/2000/svg"><path d="M285.49 292.177c4.704 4.704 4.704 12.319 0 17.011-4.704 4.704-12.319 4.704-17.011 0L182.848 223.559l-85.619 85.629c-4.704 4.704-12.319 4.704-17.011 0-4.704-4.704-4.704-12.319 0-17.011l85.619-85.629-85.619-85.629c-4.704-4.704-4.704-12.319 0-17.011 4.704-4.704 12.319-4.704 17.011 0l85.619 85.629 85.619-85.629c4.704-4.704 12.319-4.704 17.011 0 4.704 4.704 4.704 12.319 0 17.011L199.859 210.908l85.631 81.269z"/></svg>
    </div>
  );
};

export default BadgeItem;
