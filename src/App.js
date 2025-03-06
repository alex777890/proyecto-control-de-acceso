import { Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import RolePanel from './components/RolePanel';
import Navbar from './components/Navbar';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/resident-panel" element={<RolePanel />} />
                <Route path="/maintenance-panel" element={<RolePanel />} />
                <Route path="/guard-panel" element={<RolePanel />} />
                <Route path="/visitor-panel" element={<RolePanel />} />
            </Routes>
        </>
    );
}

export default App;