import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';
import Logo from '../../assets/logo.svg'; 
import GlobeVisualization from '../../components/Globe/GlobeVisualization';

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
                <img src={Logo} alt="Logo" className="logo" onClick={() => navigate('/')} /> 
                <p className="catchy-text">Chat with people around the world</p>
            </header>
            <div className="navigation">
                <p>Welcome to ChatNow! Please log in or register to continue.</p>
                <div className="nav-buttons">
                    <Link to="/login" className="login-button">Login</Link>
                    <Link to="/register" className="register-button">Register</Link>
                </div>
            </div>
            <div className="globe-container">
                <GlobeVisualization />
            </div>
            <footer className="home-footer">
                <h1 className="main-title">This project serves as the capstone for my Full Stack Web Development Certificate - Sami Kudsi</h1> 
            </footer>
        </div>
    );
}

export default Home;
