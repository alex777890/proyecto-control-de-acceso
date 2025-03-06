import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './AdminPanel.css';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
    const [users, setUsers] = useState([]);
    const [vigilantes, setVigilantes] = useState([]);
    const [autos, setAutos] = useState([]);
    const [accesos, setAccesos] = useState([]);
    const [detalleAcceso, setDetalleAcceso] = useState([]);
    const [sensores, setSensores] = useState([]);

    const [newUser, setNewUser] = useState({ nombre: '', telefono: '', email: '', password: '', id_rol: '' });
    const [editUser, setEditUser] = useState(null);
    const [newVigilante, setNewVigilante] = useState({ nombre: '', telefono: '', email: '', turno: '' });
    const [editVigilante, setEditVigilante] = useState(null);
    const [newAuto, setNewAuto] = useState({ placa: '', modelo: '', color: '', id_usuario: '' });
    const [editAuto, setEditAuto] = useState(null);
    const [newAcceso, setNewAcceso] = useState({ id_usuario: '', id_auto: '', codigo: '', estado: 'Activo', fecha_expiracion: '' });
    const [editAcceso, setEditAcceso] = useState(null);
    const [newDetalleAcceso, setNewDetalleAcceso] = useState({ id_acceso: '', id_vigilante: '', fecha_salida: '' });
    const [editDetalleAcceso, setEditDetalleAcceso] = useState(null);
    const [newSensor, setNewSensor] = useState({ ubicacion: '', estado: 'Libre' });
    const [editSensor, setEditSensor] = useState(null);
    const [excelFile, setExcelFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeSection]);

    const fetchData = async () => {
        try {
            if (activeSection === 'users') {
                const usersResponse = await axios.get('http://localhost:3001/api/usuarios', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setUsers(usersResponse.data);
            } else if (activeSection === 'vigilantes') {
                const vigilantesResponse = await axios.get('http://localhost:3001/api/vigilantes', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setVigilantes(vigilantesResponse.data);
            } else if (activeSection === 'autos') {
                const autosResponse = await axios.get('http://localhost:3001/api/autos', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setAutos(autosResponse.data);
            } else if (activeSection === 'accesos') {
                const accesosResponse = await axios.get('http://localhost:3001/api/accesos', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setAccesos(accesosResponse.data);
            } else if (activeSection === 'detalle_acceso') {
                const detalleResponse = await axios.get('http://localhost:3001/api/detalle-acceso', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setDetalleAcceso(detalleResponse.data);
            } else if (activeSection === 'sensores') {
                const sensoresResponse = await axios.get('http://localhost:3001/api/sensores', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSensores(sensoresResponse.data);
            }
        } catch (error) {
            console.error(`Error al obtener datos para ${activeSection}:`, error);
            alert(`Error al cargar los datos de ${activeSection}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('roleName');
        navigate('/', { replace: true });
    };

    // Funciones para usuarios (manteniendo funcionalidad existente)
    const handleInsertUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/register', newUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Usuario registrado con éxito');
            setNewUser({ nombre: '', telefono: '', email: '', password: '', id_rol: '' });
            fetchData();
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            alert('Error al registrar el usuario');
        }
    };
    const handleUpdateUser = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/usuarios/${id}`, editUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Usuario actualizado con éxito');
            setEditUser(null);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            alert('Error al actualizar el usuario');
        }
    };
    const handleDeleteUser = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await axios.delete(`http://localhost:3001/api/usuarios/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert('Usuario eliminado con éxito');
                fetchData();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                alert('Error al eliminar el usuario');
            }
        }
    };
    const handleExcelUpload = async (e) => {
        e.preventDefault();
        if (!excelFile) {
            alert('Por favor selecciona un archivo Excel');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            // Validar encabezados
            const expectedHeaders = ['nombre', 'telefono', 'email', 'password', 'id_rol'];
            const actualHeaders = Object.keys(jsonData[0] || {});
            if (!expectedHeaders.every(header => actualHeaders.includes(header))) {
                alert('Error: El archivo Excel debe tener los encabezados exactos: nombre, telefono, email, password, id_rol');
                return;
            }

            // Validar que cada fila tenga un password válido
            const invalidRows = jsonData.filter(row => !row.password || typeof row.password !== 'string' || row.password.trim() === '');
            if (invalidRows.length > 0) {
                alert('Error: Algunas filas tienen un campo "password" inválido o vacío. Verifica el archivo.');
                console.log('Filas inválidas:', invalidRows);
                return;
            }

            console.log('Datos enviados al backend:', jsonData); // Depuración
            try {
                const response = await axios.post('http://localhost:3001/api/import-users', jsonData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert(response.data.message);
                fetchData();
            } catch (error) {
                console.error('Error al importar usuarios:', error.response ? error.response.data : error.message);
                alert('Error al importar usuarios desde Excel: ' + (error.response ? error.response.data.message : 'Revisa la consola para más detalles'));
            }
        };
        reader.readAsArrayBuffer(excelFile);
    };

    // Funciones para vigilantes (manteniendo funcionalidad existente)
    const handleInsertVigilante = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/vigilantes', newVigilante, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Vigilante registrado con éxito');
            setNewVigilante({ nombre: '', telefono: '', email: '', turno: '' });
            fetchData();
        } catch (error) {
            console.error('Error al registrar vigilante:', error);
            alert('Error al registrar el vigilante');
        }
    };
    const handleUpdateVigilante = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/vigilantes/${id}`, editVigilante, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Vigilante actualizado con éxito');
            setEditVigilante(null);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar vigilante:', error);
            alert('Error al actualizar el vigilante');
        }
    };
    const handleDeleteVigilante = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este vigilante?')) {
            try {
                await axios.delete(`http://localhost:3001/api/vigilantes/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert('Vigilante eliminado con éxito');
                fetchData();
            } catch (error) {
                console.error('Error al eliminar vigilante:', error);
                alert('Error al eliminar el vigilante');
            }
        }
    };

    // Funciones para autos (manteniendo funcionalidad existente)
    const handleInsertAuto = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/autos', newAuto, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Auto registrado con éxito');
            setNewAuto({ placa: '', modelo: '', color: '', id_usuario: '' });
            fetchData();
        } catch (error) {
            console.error('Error al registrar auto:', error);
            alert('Error al registrar el auto');
        }
    };
    const handleUpdateAuto = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/autos/${id}`, editAuto, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Auto actualizado con éxito');
            setEditAuto(null);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar auto:', error);
            alert('Error al actualizar el auto');
        }
    };
    const handleDeleteAuto = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este auto?')) {
            try {
                await axios.delete(`http://localhost:3001/api/autos/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert('Auto eliminado con éxito');
                fetchData();
            } catch (error) {
                console.error('Error al eliminar auto:', error);
                alert('Error al eliminar el auto');
            }
        }
    };

    // Funciones para accesos (manteniendo funcionalidad existente)
    const handleInsertAcceso = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/accesos', newAcceso, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Acceso registrado con éxito');
            setNewAcceso({ id_usuario: '', id_auto: '', codigo: '', estado: 'Activo', fecha_expiracion: '' });
            fetchData();
        } catch (error) {
            console.error('Error al registrar acceso:', error);
            alert('Error al registrar el acceso');
        }
    };
    const handleUpdateAcceso = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/accesos/${id}`, editAcceso, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Acceso actualizado con éxito');
            setEditAcceso(null);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar acceso:', error);
            alert('Error al actualizar el acceso');
        }
    };
    const handleDeleteAcceso = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este acceso?')) {
            try {
                await axios.delete(`http://localhost:3001/api/accesos/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert('Acceso eliminado con éxito');
                fetchData();
            } catch (error) {
                console.error('Error al eliminar acceso:', error);
                alert('Error al eliminar el acceso');
            }
        }
    };

    // Funciones para detalle_acceso (manteniendo funcionalidad existente)
    const handleInsertDetalleAcceso = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/detalle-acceso', newDetalleAcceso, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Registro de acceso creado con éxito');
            setNewDetalleAcceso({ id_acceso: '', id_vigilante: '', fecha_salida: '' });
            fetchData();
        } catch (error) {
            console.error('Error al registrar detalle de acceso:', error);
            alert('Error al registrar el detalle de acceso');
        }
    };
    const handleUpdateDetalleAcceso = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/detalle-acceso/${id}`, editDetalleAcceso, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Registro de acceso actualizado con éxito');
            setEditDetalleAcceso(null);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar detalle de acceso:', error);
            alert('Error al actualizar el detalle de acceso');
        }
    };
    const handleDeleteDetalleAcceso = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este registro de acceso?')) {
            try {
                await axios.delete(`http://localhost:3001/api/detalle-acceso/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert('Registro de acceso eliminado con éxito');
                fetchData();
            } catch (error) {
                console.error('Error al eliminar detalle de acceso:', error);
                alert('Error al eliminar el detalle de acceso');
            }
        }
    };

    // Funciones para sensores (manteniendo funcionalidad existente)
    const handleInsertSensor = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/sensores', newSensor, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Sensor registrado con éxito');
            setNewSensor({ ubicacion: '', estado: 'Libre' });
            fetchData();
        } catch (error) {
            console.error('Error al registrar sensor:', error);
            alert('Error al registrar el sensor');
        }
    };
    const handleUpdateSensor = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/sensores/${id}`, editSensor, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Sensor actualizado con éxito');
            setEditSensor(null);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar sensor:', error);
            alert('Error al actualizar el sensor');
        }
    };
    const handleDeleteSensor = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este sensor?')) {
            try {
                await axios.delete(`http://localhost:3001/api/sensores/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert('Sensor eliminado con éxito');
                fetchData();
            } catch (error) {
                console.error('Error al eliminar sensor:', error);
                alert('Error al eliminar el sensor');
            }
        }
    };

    return (
        <div className="admin-panel">
            <button className="toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <i className={isSidebarOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <h2 className="sidebar-title">Control Acceso</h2>
                <ul className="sidebar-menu">
                    <li>
                        <button onClick={() => { setActiveSection('users'); setIsSidebarOpen(false); }} className={activeSection === 'users' ? 'active' : ''}>
                            <i className="fas fa-users"></i> Usuarios
                        </button>
                    </li>
                    <li>
                        <button onClick={() => { setActiveSection('vigilantes'); setIsSidebarOpen(false); }} className={activeSection === 'vigilantes' ? 'active' : ''}>
                            <i className="fas fa-shield-alt"></i> Vigilantes
                        </button>
                    </li>
                    <li>
                        <button onClick={() => { setActiveSection('autos'); setIsSidebarOpen(false); }} className={activeSection === 'autos' ? 'active' : ''}>
                            <i className="fas fa-car"></i> Autos
                        </button>
                    </li>
                    <li>
                        <button onClick={() => { setActiveSection('accesos'); setIsSidebarOpen(false); }} className={activeSection === 'accesos' ? 'active' : ''}>
                            <i className="fas fa-key"></i> Accesos
                        </button>
                    </li>
                    <li>
                        <button onClick={() => { setActiveSection('detalle_acceso'); setIsSidebarOpen(false); }} className={activeSection === 'detalle_acceso' ? 'active' : ''}>
                            <i className="fas fa-history"></i> Entradas/Salidas
                        </button>
                    </li>
                    <li>
                        <button onClick={() => { setActiveSection('sensores'); setIsSidebarOpen(false); }} className={activeSection === 'sensores' ? 'active' : ''}>
                            <i className="fas fa-sensor"></i> Sensores
                        </button>
                    </li>
                    <li>
                        <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="logout-button">
                            <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </div>
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="content-header">
                    <h1>
                        {activeSection === 'users' && 'Administración de Usuarios'}
                        {activeSection === 'vigilantes' && 'Administración de Vigilantes'}
                        {activeSection === 'autos' && 'Administración de Autos'}
                        {activeSection === 'accesos' && 'Gestión de Accesos'}
                        {activeSection === 'detalle_acceso' && 'Registro de Entradas/Salidas'}
                        {activeSection === 'sensores' && 'Control de Sensores'}
                    </h1>
                </div>
                <div className="content-body">
                    <div className="content-sections">
                        <div className="form-column">
                            {activeSection === 'users' && (
                                <>
                                    <form onSubmit={handleInsertUser} className="form-section">
                                        <div className="form-group">
                                            <label>Nombre</label>
                                            <input
                                                type="text"
                                                placeholder="Nombre"
                                                value={newUser.nombre}
                                                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Teléfono</label>
                                            <input
                                                type="text"
                                                placeholder="Teléfono"
                                                value={newUser.telefono}
                                                onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Contraseña</label>
                                            <input
                                                type="password"
                                                placeholder="Contraseña"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Rol</label>
                                            <select
                                                value={newUser.id_rol}
                                                onChange={(e) => setNewUser({ ...newUser, id_rol: e.target.value })}
                                                required
                                            >
                                                <option value="">Selecciona un rol</option>
                                                <option value="1">Admin</option>
                                                <option value="2">Residente</option>
                                                <option value="3">Mantenimiento</option>
                                                <option value="4">Vigilante</option>
                                                <option value="5">Visitante</option>
                                            </select>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn-submit">Agregar</button>
                                            <button type="button" className="btn-cancel">Cancelar</button>
                                        </div>
                                    </form>
                                    <div className="excel-import-section">
                                        <form onSubmit={handleExcelUpload}>
                                            <div className="form-group">
                                                <label>Importar desde Excel</label>
                                                <input
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    onChange={(e) => setExcelFile(e.target.files[0])}
                                                />
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" className="btn-submit">Importar</button>
                                                <button type="button" className="btn-cancel">Cancelar</button>
                                            </div>
                                            <p>El archivo debe tener columnas: nombre, telefono, email, password, id_rol</p>
                                        </form>
                                    </div>
                                </>
                            )}

                            {activeSection === 'vigilantes' && (
                                <form onSubmit={handleInsertVigilante} className="form-section">
                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            placeholder="Nombre"
                                            value={newVigilante.nombre}
                                            onChange={(e) => setNewVigilante({ ...newVigilante, nombre: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input
                                            type="text"
                                            placeholder="Teléfono"
                                            value={newVigilante.telefono}
                                            onChange={(e) => setNewVigilante({ ...newVigilante, telefono: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={newVigilante.email}
                                            onChange={(e) => setNewVigilante({ ...newVigilante, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Turno</label>
                                        <select
                                            value={newVigilante.turno}
                                            onChange={(e) => setNewVigilante({ ...newVigilante, turno: e.target.value })}
                                            required
                                        >
                                            <option value="">Selecciona turno</option>
                                            <option value="Día">Día</option>
                                            <option value="Noche">Noche</option>
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-submit">Agregar</button>
                                        <button type="button" className="btn-cancel">Cancelar</button>
                                    </div>
                                </form>
                            )}

                            {activeSection === 'autos' && (
                                <form onSubmit={handleInsertAuto} className="form-section">
                                    <div className="form-group">
                                        <label>Placa</label>
                                        <input
                                            type="text"
                                            placeholder="Placa"
                                            value={newAuto.placa}
                                            onChange={(e) => setNewAuto({ ...newAuto, placa: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Modelo</label>
                                        <input
                                            type="text"
                                            placeholder="Modelo"
                                            value={newAuto.modelo}
                                            onChange={(e) => setNewAuto({ ...newAuto, modelo: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Color</label>
                                        <input
                                            type="text"
                                            placeholder="Color"
                                            value={newAuto.color}
                                            onChange={(e) => setNewAuto({ ...newAuto, color: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ID Usuario</label>
                                        <input
                                            type="number"
                                            placeholder="ID Usuario"
                                            value={newAuto.id_usuario}
                                            onChange={(e) => setNewAuto({ ...newAuto, id_usuario: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-submit">Agregar</button>
                                        <button type="button" className="btn-cancel">Cancelar</button>
                                    </div>
                                </form>
                            )}

                            {activeSection === 'accesos' && (
                                <form onSubmit={handleInsertAcceso} className="form-section">
                                    <div className="form-group">
                                        <label>ID Usuario</label>
                                        <input
                                            type="number"
                                            placeholder="ID Usuario"
                                            value={newAcceso.id_usuario}
                                            onChange={(e) => setNewAcceso({ ...newAcceso, id_usuario: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ID Auto</label>
                                        <input
                                            type="number"
                                            placeholder="ID Auto"
                                            value={newAcceso.id_auto}
                                            onChange={(e) => setNewAcceso({ ...newAcceso, id_auto: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Código</label>
                                        <input
                                            type="text"
                                            placeholder="Código"
                                            value={newAcceso.codigo}
                                            onChange={(e) => setNewAcceso({ ...newAcceso, codigo: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <select
                                            value={newAcceso.estado}
                                            onChange={(e) => setNewAcceso({ ...newAcceso, estado: e.target.value })}
                                            required
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Expirado">Expirado</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha Expiración</label>
                                        <input
                                            type="datetime-local"
                                            value={newAcceso.fecha_expiracion}
                                            onChange={(e) => setNewAcceso({ ...newAcceso, fecha_expiracion: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-submit">Agregar</button>
                                        <button type="button" className="btn-cancel">Cancelar</button>
                                    </div>
                                </form>
                            )}

                            {activeSection === 'detalle_acceso' && (
                                <form onSubmit={handleInsertDetalleAcceso} className="form-section">
                                    <div className="form-group">
                                        <label>ID Acceso</label>
                                        <input
                                            type="number"
                                            placeholder="ID Acceso"
                                            value={newDetalleAcceso.id_acceso}
                                            onChange={(e) => setNewDetalleAcceso({ ...newDetalleAcceso, id_acceso: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ID Vigilante</label>
                                        <input
                                            type="number"
                                            placeholder="ID Vigilante"
                                            value={newDetalleAcceso.id_vigilante}
                                            onChange={(e) => setNewDetalleAcceso({ ...newDetalleAcceso, id_vigilante: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha Salida</label>
                                        <input
                                            type="datetime-local"
                                            value={newDetalleAcceso.fecha_salida}
                                            onChange={(e) => setNewDetalleAcceso({ ...newDetalleAcceso, fecha_salida: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-submit">Agregar</button>
                                        <button type="button" className="btn-cancel">Cancelar</button>
                                    </div>
                                </form>
                            )}

                            {activeSection === 'sensores' && (
                                <form onSubmit={handleInsertSensor} className="form-section">
                                    <div className="form-group">
                                        <label>Ubicación</label>
                                        <input
                                            type="text"
                                            placeholder="Ubicación"
                                            value={newSensor.ubicacion}
                                            onChange={(e) => setNewSensor({ ...newSensor, ubicacion: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <select
                                            value={newSensor.estado}
                                            onChange={(e) => setNewSensor({ ...newSensor, estado: e.target.value })}
                                            required
                                        >
                                            <option value="Libre">Libre</option>
                                            <option value="Ocupado">Ocupado</option>
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-submit">Agregar</button>
                                        <button type="button" className="btn-cancel">Cancelar</button>
                                    </div>
                                </form>
                            )}
                        </div>
                        <div className="table-column">
                            {activeSection === 'users' && (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Teléfono</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id_usuario}>
                                                <td>{user.id_usuario}</td>
                                                <td>
                                                    {editUser && editUser.id_usuario === user.id_usuario ? (
                                                        <input
                                                            type="text"
                                                            value={editUser.nombre}
                                                            onChange={(e) => setEditUser({ ...editUser, nombre: e.target.value })}
                                                        />
                                                    ) : (
                                                        user.nombre
                                                    )}
                                                </td>
                                                <td>
                                                    {editUser && editUser.id_usuario === user.id_usuario ? (
                                                        <input
                                                            type="text"
                                                            value={editUser.telefono}
                                                            onChange={(e) => setEditUser({ ...editUser, telefono: e.target.value })}
                                                        />
                                                    ) : (
                                                        user.telefono
                                                    )}
                                                </td>
                                                <td>
                                                    {editUser && editUser.id_usuario === user.id_usuario ? (
                                                        <input
                                                            type="email"
                                                            value={editUser.email}
                                                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                                        />
                                                    ) : (
                                                        user.email
                                                    )}
                                                </td>
                                                <td>
                                                    {editUser && editUser.id_usuario === user.id_usuario ? (
                                                        <select
                                                            value={editUser.id_rol}
                                                            onChange={(e) => setEditUser({ ...editUser, id_rol: e.target.value })}
                                                        >
                                                            <option value="1">Admin</option>
                                                            <option value="2">Residente</option>
                                                            <option value="3">Mantenimiento</option>
                                                            <option value="4">Vigilante</option>
                                                            <option value="5">Visitante</option>
                                                        </select>
                                                    ) : (
                                                        user.id_rol
                                                    )}
                                                </td>
                                                <td>
                                                    {editUser && editUser.id_usuario === user.id_usuario ? (
                                                        <>
                                                            <button onClick={() => handleUpdateUser(user.id_usuario)} className="btn-action">Guardar</button>
                                                            <button onClick={() => setEditUser(null)} className="btn-action">Cancelar</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditUser(user)} className="btn-action">Editar</button>
                                                            <button onClick={() => handleDeleteUser(user.id_usuario)} className="btn-action">Eliminar</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeSection === 'vigilantes' && (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Teléfono</th>
                                            <th>Email</th>
                                            <th>Turno</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vigilantes.map((vigilante) => (
                                            <tr key={vigilante.id_vigilante}>
                                                <td>{vigilante.id_vigilante}</td>
                                                <td>
                                                    {editVigilante && editVigilante.id_vigilante === vigilante.id_vigilante ? (
                                                        <input
                                                            type="text"
                                                            value={editVigilante.nombre}
                                                            onChange={(e) => setEditVigilante({ ...editVigilante, nombre: e.target.value })}
                                                        />
                                                    ) : (
                                                        vigilante.nombre
                                                    )}
                                                </td>
                                                <td>
                                                    {editVigilante && editVigilante.id_vigilante === vigilante.id_vigilante ? (
                                                        <input
                                                            type="text"
                                                            value={editVigilante.telefono}
                                                            onChange={(e) => setEditVigilante({ ...editVigilante, telefono: e.target.value })}
                                                        />
                                                    ) : (
                                                        vigilante.telefono
                                                    )}
                                                </td>
                                                <td>
                                                    {editVigilante && editVigilante.id_vigilante === vigilante.id_vigilante ? (
                                                        <input
                                                            type="email"
                                                            value={editVigilante.email}
                                                            onChange={(e) => setEditVigilante({ ...editVigilante, email: e.target.value })}
                                                        />
                                                    ) : (
                                                        vigilante.email
                                                    )}
                                                </td>
                                                <td>
                                                    {editVigilante && editVigilante.id_vigilante === vigilante.id_vigilante ? (
                                                        <select
                                                            value={editVigilante.turno}
                                                            onChange={(e) => setEditVigilante({ ...editVigilante, turno: e.target.value })}
                                                        >
                                                            <option value="Día">Día</option>
                                                            <option value="Noche">Noche</option>
                                                        </select>
                                                    ) : (
                                                        vigilante.turno
                                                    )}
                                                </td>
                                                <td>
                                                    {editVigilante && editVigilante.id_vigilante === vigilante.id_vigilante ? (
                                                        <>
                                                            <button onClick={() => handleUpdateVigilante(vigilante.id_vigilante)} className="btn-action">Guardar</button>
                                                            <button onClick={() => setEditVigilante(null)} className="btn-action">Cancelar</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditVigilante(vigilante)} className="btn-action">Editar</button>
                                                            <button onClick={() => handleDeleteVigilante(vigilante.id_vigilante)} className="btn-action">Eliminar</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeSection === 'autos' && (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Placa</th>
                                            <th>Modelo</th>
                                            <th>Color</th>
                                            <th>ID Usuario</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {autos.map((auto) => (
                                            <tr key={auto.id_auto}>
                                                <td>{auto.id_auto}</td>
                                                <td>
                                                    {editAuto && editAuto.id_auto === auto.id_auto ? (
                                                        <input
                                                            type="text"
                                                            value={editAuto.placa}
                                                            onChange={(e) => setEditAuto({ ...editAuto, placa: e.target.value })}
                                                        />
                                                    ) : (
                                                        auto.placa
                                                    )}
                                                </td>
                                                <td>
                                                    {editAuto && editAuto.id_auto === auto.id_auto ? (
                                                        <input
                                                            type="text"
                                                            value={editAuto.modelo}
                                                            onChange={(e) => setEditAuto({ ...editAuto, modelo: e.target.value })}
                                                        />
                                                    ) : (
                                                        auto.modelo
                                                    )}
                                                </td>
                                                <td>
                                                    {editAuto && editAuto.id_auto === auto.id_auto ? (
                                                        <input
                                                            type="text"
                                                            value={editAuto.color}
                                                            onChange={(e) => setEditAuto({ ...editAuto, color: e.target.value })}
                                                        />
                                                    ) : (
                                                        auto.color
                                                    )}
                                                </td>
                                                <td>
                                                    {editAuto && editAuto.id_auto === auto.id_auto ? (
                                                        <input
                                                            type="number"
                                                            value={editAuto.id_usuario}
                                                            onChange={(e) => setEditAuto({ ...editAuto, id_usuario: e.target.value })}
                                                        />
                                                    ) : (
                                                        auto.id_usuario
                                                    )}
                                                </td>
                                                <td>
                                                    {editAuto && editAuto.id_auto === auto.id_auto ? (
                                                        <>
                                                            <button onClick={() => handleUpdateAuto(auto.id_auto)} className="btn-action">Guardar</button>
                                                            <button onClick={() => setEditAuto(null)} className="btn-action">Cancelar</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditAuto(auto)} className="btn-action">Editar</button>
                                                            <button onClick={() => handleDeleteAuto(auto.id_auto)} className="btn-action">Eliminar</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeSection === 'accesos' && (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>ID Usuario</th>
                                            <th>ID Auto</th>
                                            <th>Código</th>
                                            <th>Estado</th>
                                            <th>Fecha Expiración</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accesos.map((acceso) => (
                                            <tr key={acceso.id_acceso}>
                                                <td>{acceso.id_acceso}</td>
                                                <td>
                                                    {editAcceso && editAcceso.id_acceso === acceso.id_acceso ? (
                                                        <input
                                                            type="number"
                                                            value={editAcceso.id_usuario}
                                                            onChange={(e) => setEditAcceso({ ...editAcceso, id_usuario: e.target.value })}
                                                        />
                                                    ) : (
                                                        acceso.id_usuario
                                                    )}
                                                </td>
                                                <td>
                                                    {editAcceso && editAcceso.id_acceso === acceso.id_acceso ? (
                                                        <input
                                                            type="number"
                                                            value={editAcceso.id_auto}
                                                            onChange={(e) => setEditAcceso({ ...editAcceso, id_auto: e.target.value })}
                                                        />
                                                    ) : (
                                                        acceso.id_auto
                                                    )}
                                                </td>
                                                <td>
                                                    {editAcceso && editAcceso.id_acceso === acceso.id_acceso ? (
                                                        <input
                                                            type="text"
                                                            value={editAcceso.codigo}
                                                            onChange={(e) => setEditAcceso({ ...editAcceso, codigo: e.target.value })}
                                                        />
                                                    ) : (
                                                        acceso.codigo
                                                    )}
                                                </td>
                                                <td>
                                                    {editAcceso && editAcceso.id_acceso === acceso.id_acceso ? (
                                                        <select
                                                            value={editAcceso.estado}
                                                            onChange={(e) => setEditAcceso({ ...editAcceso, estado: e.target.value })}
                                                        >
                                                            <option value="Activo">Activo</option>
                                                            <option value="Expirado">Expirado</option>
                                                        </select>
                                                    ) : (
                                                        acceso.estado
                                                    )}
                                                </td>
                                                <td>
                                                    {editAcceso && editAcceso.id_acceso === acceso.id_acceso ? (
                                                        <input
                                                            type="datetime-local"
                                                            value={editAcceso.fecha_expiracion}
                                                            onChange={(e) => setEditAcceso({ ...editAcceso, fecha_expiracion: e.target.value })}
                                                        />
                                                    ) : (
                                                        acceso.fecha_expiracion
                                                    )}
                                                </td>
                                                <td>
                                                    {editAcceso && editAcceso.id_acceso === acceso.id_acceso ? (
                                                        <>
                                                            <button onClick={() => handleUpdateAcceso(acceso.id_acceso)} className="btn-action">Guardar</button>
                                                            <button onClick={() => setEditAcceso(null)} className="btn-action">Cancelar</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditAcceso(acceso)} className="btn-action">Editar</button>
                                                            <button onClick={() => handleDeleteAcceso(acceso.id_acceso)} className="btn-action">Eliminar</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeSection === 'detalle_acceso' && (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>ID Acceso</th>
                                            <th>ID Vigilante</th>
                                            <th>Fecha Entrada</th>
                                            <th>Fecha Salida</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detalleAcceso.map((detalle) => (
                                            <tr key={detalle.id_detalle_acceso}>
                                                <td>{detalle.id_detalle_acceso}</td>
                                                <td>
                                                    {editDetalleAcceso && editDetalleAcceso.id_detalle_acceso === detalle.id_detalle_acceso ? (
                                                        <input
                                                            type="number"
                                                            value={editDetalleAcceso.id_acceso}
                                                            onChange={(e) => setEditDetalleAcceso({ ...editDetalleAcceso, id_acceso: e.target.value })}
                                                        />
                                                    ) : (
                                                        detalle.id_acceso
                                                    )}
                                                </td>
                                                <td>
                                                    {editDetalleAcceso && editDetalleAcceso.id_detalle_acceso === detalle.id_detalle_acceso ? (
                                                        <input
                                                            type="number"
                                                            value={editDetalleAcceso.id_vigilante}
                                                            onChange={(e) => setEditDetalleAcceso({ ...editDetalleAcceso, id_vigilante: e.target.value })}
                                                        />
                                                    ) : (
                                                        detalle.id_vigilante
                                                    )}
                                                </td>
                                                <td>{detalle.fecha_entrada}</td>
                                                <td>
                                                    {editDetalleAcceso && editDetalleAcceso.id_detalle_acceso === detalle.id_detalle_acceso ? (
                                                        <input
                                                            type="datetime-local"
                                                            value={editDetalleAcceso.fecha_salida}
                                                            onChange={(e) => setEditDetalleAcceso({ ...editDetalleAcceso, fecha_salida: e.target.value })}
                                                        />
                                                    ) : (
                                                        detalle.fecha_salida
                                                    )}
                                                </td>
                                                <td>
                                                    {editDetalleAcceso && editDetalleAcceso.id_detalle_acceso === detalle.id_detalle_acceso ? (
                                                        <>
                                                            <button onClick={() => handleUpdateDetalleAcceso(detalle.id_detalle_acceso)} className="btn-action">Guardar</button>
                                                            <button onClick={() => setEditDetalleAcceso(null)} className="btn-action">Cancelar</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditDetalleAcceso(detalle)} className="btn-action">Editar</button>
                                                            <button onClick={() => handleDeleteDetalleAcceso(detalle.id_detalle_acceso)} className="btn-action">Eliminar</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeSection === 'sensores' && (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Ubicación</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sensores.map((sensor) => (
                                            <tr key={sensor.id_sensor}>
                                                <td>{sensor.id_sensor}</td>
                                                <td>
                                                    {editSensor && editSensor.id_sensor === sensor.id_sensor ? (
                                                        <input
                                                            type="text"
                                                            value={editSensor.ubicacion}
                                                            onChange={(e) => setEditSensor({ ...editSensor, ubicacion: e.target.value })}
                                                        />
                                                    ) : (
                                                        sensor.ubicacion
                                                    )}
                                                </td>
                                                <td>
                                                    {editSensor && editSensor.id_sensor === sensor.id_sensor ? (
                                                        <select
                                                            value={editSensor.estado}
                                                            onChange={(e) => setEditSensor({ ...editSensor, estado: e.target.value })}
                                                        >
                                                            <option value="Libre">Libre</option>
                                                            <option value="Ocupado">Ocupado</option>
                                                        </select>
                                                    ) : (
                                                        sensor.estado
                                                    )}
                                                </td>
                                                <td>
                                                    {editSensor && editSensor.id_sensor === sensor.id_sensor ? (
                                                        <>
                                                            <button onClick={() => handleUpdateSensor(sensor.id_sensor)} className="btn-action">Guardar</button>
                                                            <button onClick={() => setEditSensor(null)} className="btn-action">Cancelar</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditSensor(sensor)} className="btn-action">Editar</button>
                                                            <button onClick={() => handleDeleteSensor(sensor.id_sensor)} className="btn-action">Eliminar</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;