import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
    const token = localStorage.getItem('token');
    const [role, setRole] = useState('');

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setRole(decodedToken.role); // Asegúrate de que esto sea una cadena
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    }, [token]);

    return (
        <nav>
            
            {role === '1' && <Link to="/admin">Panel de Administración</Link>}
            {role && typeof role === 'string' && (
                <Link to={`/role-panel/${role}`}>Panel de {role.charAt(0).toUpperCase() + role.slice(1)}</Link>
            )}
        </nav>
    );
};

export default Navbar;