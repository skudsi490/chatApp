import './globalStyles.css';
import { Route, Routes } from "react-router-dom";
import Home from './pages/HomePage/HomePage';
import Chat from "./pages/Chat/Chat";
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chats" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
