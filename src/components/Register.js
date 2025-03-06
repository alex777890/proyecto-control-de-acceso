import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterStyles.css'; 
import logoint2 from '../img/logoint2.png'; 


const Register = () => {
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [id_rol, setIdRol] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/register', { nombre, telefono, email, password, id_rol });
            alert('Usuario registrado con éxito. Redirigiendo al inicio de sesión...');
            navigate('/'); // Redirigir al inicio de sesión
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            alert('Error al registrar el usuario. Verifica los datos.');
        }
    };

    return (
        <div className="register-container"> 
            <div className="register-box"> 
            <img src={logoint2} alt="Logo" className="register-logo" /> 
                <h2>Registro</h2>
                <form onSubmit={handleRegister}>
                    <div className="input-group"> 
                        <label htmlFor="nombre">Nombre:</label>
                        <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="input-group"> 
                        <label htmlFor="telefono">Teléfono:</label>
                        <input type="text" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                    </div>
                    <div className="input-group"> 
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group"> 
                        <label htmlFor="password">Contraseña:</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="input-group"> 
                        <label htmlFor="rol">Rol:</label>
                        <select id="rol" value={id_rol} onChange={(e) => setIdRol(e.target.value)} required>
                            <option value="">Selecciona un rol</option>
                            <option value="2">Residente</option>
                            <option value="3">Mantenimiento</option>
                            <option value="4">Vigilante</option>
                            <option value="5">Visitante</option>
                        </select>
                    </div>
                    <button type="submit" className="register-button">Registrar</button>
                </form>
            </div>
        </div>
    );
};

export default Register;