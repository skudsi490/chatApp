import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../features/chat/chatSlice';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    if (!name || !email || !password || password !== confirmPassword) {
      alert('Please fill all fields and ensure passwords match.');
      setLoading(false);
      return;
    }

    const userData = {
      fullName: name,
      emailAddress: email,
      password
    };

    dispatch(registerUser(userData))
      .unwrap()
      .then(() => {
        alert('Registration successful');
        navigate('/login');
      })
      .catch((error) => {
        console.error('Registration Failed:', error);
        alert(`Registration failed: ${error}`);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <div className="form-control">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-control">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-control">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="form-control">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button className="register-button" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  );
};

export default Register;
