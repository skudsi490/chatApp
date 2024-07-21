import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../features/chat/chatSlice';
import './Login.css';
import Logo from '../../assets/logo.svg'; // Import the logo

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    if (!email || !password) {
      alert('Please fill all fields');
      setLoading(false);
      return;
    }

    dispatch(loginUser({ emailAddress: email, password }))
      .unwrap()
      .then(() => {
        navigate('/chats');
        alert('Login Successful');
      })
      .catch((error) => {
        console.error('Login Failed:', error);
        alert(`Login Failed: ${error.message || 'Unknown error'}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="login-container">
      <img src={Logo} alt="Logo" className="logo" onClick={() => navigate('/')} /> 
      <h1>Login</h1>
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
      <button className="login-button" onClick={handleLogin} disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
      <div className="register-link">
        <p>Dont have an account? <Link to="/register">Register now</Link></p> 
      </div>
    </div>
  );
};

export default Login;
