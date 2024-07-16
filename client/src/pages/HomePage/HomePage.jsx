import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';
import Logo from '../../assets/logo.svg'; 

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            navigate("/chats"); 
        }
    }, [navigate]);

    return (
        <div className="home-container">
            <header className="home-header">
                <img src={Logo} alt="Logo" className="logo" /> 
                <h1>This Project is Final Project Part of Full Stack Web Development Certificate </h1> 
            </header>
            <div className="navigation">
                <p>Welcome to ChatNow! Please log in or register to continue.</p>
                <div className="nav-buttons">
                    <Link to="/login" className="login-button">Login</Link>
                    <Link to="/register" className="register-button">Register</Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
