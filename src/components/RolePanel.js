import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RolePanelStyles.css';

const RolePanel = () => {
    const navigate = useNavigate();
    const roleName = localStorage.getItem('roleName') || 'Usuario';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('roleName');
        navigate('/', { replace: true }); // Usar replace para evitar regresar al panel
    };

    return (
        <div className="role-panel-container"> 
            <div className="role-panel-box"> 
                <h2>Panel de {roleName}</h2>
                <p>Bienvenido, {roleName}. Tienes acceso limitado a ciertas funciones.</p>
                <div className="role-panel-buttons"> 
                    <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
                </div>
            </div>
        </div>
    );
};

export default RolePanel;