import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Configuracion = () => {
    const [esMovil, setEsMovil] = useState(window.innerWidth < 1024);
    const [fechaActual, setFechaActual] = useState(new Date());

    const [tiempoConvocatoria, setTiempoConvocatoria] = useState('10');
    const [filtroRango, setFiltroRango] = useState('3');

    const [busquedaEspecialidad, setBusquedaEspecialidad] = useState('');
    const [catEspecialidades, setCatEspecialidades] = useState([
        { id: 1, nombre: 'Operador de Grúa Pórtico', activo: true },
        { id: 2, nombre: 'Montacarguista', activo: true },
        { id: 3, nombre: 'Supervisor de Patio', activo: true }
    ]);

    // función para normalizar cadenas (eliminar acentos y convertir a minúsculas)
    const normalize = (s) => s ? s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase() : '';

    const [usuario, setUsuario] = useState({});

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario_sgn');
        if (usuarioGuardado) {
            try {
                setUsuario(JSON.parse(usuarioGuardado));
            } catch (error) {
                console.error('Error al parsear usuario:', error);
            }
        }
    }, []);

    const nombreCompleto = usuario?.nombre_completo || usuario?.nombre || 'Invitado';
    const partesNombre = nombreCompleto.split(' ');
    const nombreDinamico = partesNombre.slice(0, 2).join(' ');
    const apellidoDinamico = partesNombre.slice(2).join(' ') || '';
    const matriculaDinamica = usuario?.num_control || 'NOM-0012';
    const rolDinamico = usuario?.rol || 'Nombrador';

    useEffect(() => {
        const handleResize = () => setEsMovil(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setFechaActual(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatearFecha = () => fechaActual.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formatearHora = () => fechaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const handleGuardarGlobal = (e) => {
        e.preventDefault();
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Configuración guardada correctamente',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    };

    const handleAgregarEspecialidad = () => {
        if (!busquedaEspecialidad.trim()) return;

        const nombreNormalizado = normalize(busquedaEspecialidad.trim());
        const existe = catEspecialidades.some(esp => esp.activo && normalize(esp.nombre) === nombreNormalizado);
        if (existe) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'La especialidad ya existe', showConfirmButton: false, timer: 2000 });
            return;
        }

        const nueva = {
            id: Date.now(),
            nombre: busquedaEspecialidad.trim(),
            activo: true
        };

        setCatEspecialidades([...catEspecialidades, nueva]);
        setBusquedaEspecialidad('');

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Especialidad agregada correctamente',
            showConfirmButton: false,
            timer: 2000
        });
    };

    const handleBorradoLogico = () => {
        const termino = busquedaEspecialidad.trim();
        if (!termino) return;
        const matches = catEspecialidades.filter(esp => esp.activo && normalize(esp.nombre).includes(normalize(termino)));
        if (matches.length === 0) return;
        if (matches.length === 1) {
            const id = matches[0].id;
            setCatEspecialidades(catEspecialidades.map(esp => esp.id === id ? { ...esp, activo: false } : esp));
            setBusquedaEspecialidad('');
            Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Especialidad dada de baja correctamente', showConfirmButton: false, timer: 2000 });
            return;
        }

        // Si hay múltiples matches, pedir al usuario que seleccione cuál dar de baja
        Swal.fire({
            title: 'Selecciona la especialidad a dar de baja',
            input: 'select',
            inputOptions: matches.reduce((acc, m) => (acc[m.id] = m.nombre, acc), {}),
            inputPlaceholder: 'Selecciona una especialidad',
            showCancelButton: true
        }).then(res => {
            if (res.isConfirmed && res.value) {
                const idSel = Number(res.value);
                setCatEspecialidades(catEspecialidades.map(esp => esp.id === idSel ? { ...esp, activo: false } : esp));
                setBusquedaEspecialidad('');
                Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Especialidad dada de baja correctamente', showConfirmButton: false, timer: 2000 });
            }
        });
    };

    // Filtrar especialidades activas que coincidan con la búsqueda
    const matches = busquedaEspecialidad.trim() ? catEspecialidades.filter(esp => esp.activo && normalize(esp.nombre).includes(normalize(busquedaEspecialidad.trim()))) : [];
    const existeExacta = catEspecialidades.some(esp => esp.activo && normalize(esp.nombre) === normalize(busquedaEspecialidad.trim()));

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap', width: '100%', position: 'relative', marginBottom: '20px' }}>
                <h1 style={{ fontSize: esMovil ? '1.5rem' : '2rem', color: '#122C5F', margin: 0, fontWeight: 'bold' }}>
                    Configuración
                </h1>
                <div style={{ textAlign: 'right', color: '#717171', fontSize: esMovil ? '0.8rem' : '1rem', fontWeight: '600' }}>
                    <div style={{ textTransform: 'capitalize', lineHeight: '1.2' }}>{formatearFecha()}</div>
                    <span style={{ fontSize: esMovil ? '1rem' : '1.2rem', color: '#122C5F', display: 'block', fontWeight: 'bold' }}>{formatearHora()}</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: esMovil ? '25px' : '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', width: '100%', maxWidth: '850px' }}>

                    <form onSubmit={handleGuardarGlobal}>

                        <div style={sectionStyle}>
                            <h2 style={sectionTitleStyle}>Mi Perfil</h2>
                            <p style={sectionSubtitleStyle}>Información personal sincronizada con tu sesión actual.</p>

                            <div style={formGrid}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Nombre(s)</label>
                                    <input type="text" value={nombreDinamico} disabled style={inputDisabledStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Apellidos</label>
                                    <input type="text" value={apellidoDinamico} disabled style={inputDisabledStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Matrícula Institucional</label>
                                    <input type="text" value={matriculaDinamica} disabled style={inputDisabledStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Rol en el Sistema</label>
                                    <input type="text" value={rolDinamico} disabled style={inputDisabledStyle} />
                                </div>
                            </div>
                        </div>

                        <div style={sectionStyle}>
                            <h2 style={sectionTitleStyle}>Reglas de Nombramientos</h2>
                            <p style={sectionSubtitleStyle}>Ajusta los parámetros predeterminados para las convocatorias.</p>

                            <div style={formGrid}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Temporizador Estándar (Minutos)</label>
                                    <select
                                        value={tiempoConvocatoria}
                                        onChange={(e) => setTiempoConvocatoria(e.target.value)}
                                        style={inputStyle}
                                    >
                                        <option value="5">5 Minutos</option>
                                        <option value="10">10 Minutos</option>
                                        <option value="15">15 Minutos</option>
                                        <option value="30">30 Minutos</option>
                                    </select>
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Filtro de Rango para el Panel Principal</label>
                                    <select
                                        value={filtroRango}
                                        onChange={(e) => setFiltroRango(e.target.value)}
                                        style={inputStyle}
                                    >
                                        <option value="1">Hoy (1 día)</option>
                                        <option value="3">Últimos 3 días</option>
                                        <option value="7">Última semana (7 días)</option>
                                        <option value="cerrados">Solo cerrados</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Seccion especialidades */}
                        <div style={{ ...sectionStyle, borderBottom: 'none', marginBottom: '0', paddingBottom: '0' }}>
                            <h2 style={sectionTitleStyle}>Gestión de Especialidades</h2>
                            <p style={sectionSubtitleStyle}>Busca para dar de baja o escribe para añadir una nueva.</p>

                            <div style={formGroup}>
                                <label style={labelStyle}>Buscador / Registro de Especialidad</label>

                              
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                    <input
                                        type="text"
                                        placeholder="Ej. Operador de Grúa..."
                                        value={busquedaEspecialidad}
                                        onChange={(e) => setBusquedaEspecialidad(e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            flex: 1,          
                                            minWidth: '600px', 
                                            height: '42px',   
                                            margin: 0
                                           
                                        }}
                                    />

                                    {busquedaEspecialidad.trim() !== '' && (
                                        existeExacta ? (
                                            <button type="button" onClick={handleBorradoLogico} style={btnAccionStyle}>
                                                Dar de baja
                                            </button>
                                        ) : (
                                            <button type="button" onClick={handleAgregarEspecialidad} style={btnAccionStyle}>
                                                Agregar
                                            </button>
                                        )
                                    )}
                                </div>

                                {/* LISTA DE COINCIDENCIAS (Flotante) */}
                                {matches.length > 0 && (
                                    <ul style={{
                                        listStyle: 'none',
                                        margin: '8px 0 0 0',
                                        padding: '4px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        maxHeight: '120px',
                                        overflowY: 'auto',
                                        backgroundColor: '#fff',
                                        width: '100%',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        {matches.map(m => (
                                            <li key={m.id} onClick={() => setBusquedaEspecialidad(m.nombre)} style={{ padding: '8px', cursor: 'pointer', borderRadius: '4px', borderBottom: '1px solid #f3f4f6' }}>
                                                {m.nombre}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                            <button type="submit" style={btnPrimary}>
                                Guardar Configuración
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
};

const sectionStyle = { marginBottom: '35px', paddingBottom: '30px', borderBottom: '2px solid #f3f4f6' };
const sectionTitleStyle = { fontSize: '1.4rem', color: '#122C5F', margin: '0 0 5px 0', fontWeight: 'bold' };
const sectionSubtitleStyle = { fontSize: '0.9rem', color: '#6b7280', margin: '0 0 25px 0' };

const btnPrimary = { backgroundColor: '#1a8a34', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(26,138,52,0.2)', transition: 'transform 0.1s' };
const btnAccionStyle = {
    backgroundColor: '#122C5F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', height: '42px', padding: '0 16px', whiteSpace: 'nowrap'
};

const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' };
const formGroup = { display: 'flex', flexDirection: 'column' };
const labelStyle = { fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '8px' };
const inputStyle = { padding: '12px 15px', border: '1px solid #d1d5db', boxSizing: 'border-box', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', color: '#1f2937', backgroundColor: '#f9fafb' };
const inputDisabledStyle = { ...inputStyle, backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed', border: '1px solid #e5e7eb' };

export default Configuracion;
