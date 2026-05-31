import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Configuracion.css';
import FechaHoraActual from '../../components/FechaHoraActual/FechaHoraActual';


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

    const [usuario, setUsuario] = useState({});

    const normalize = (s) =>
        s
            ? s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
            : '';

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

    useEffect(() => {
        const handleResize = () => setEsMovil(window.innerWidth < 1024);

        window.addEventListener('resize', handleResize);

        return () =>
            window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setInterval(
            () => setFechaActual(new Date()),
            1000
        );

        return () => clearInterval(timer);
    }, []);

    const nombreCompleto =
        usuario?.nombre_completo ||
        usuario?.nombre ||
        'Invitado';

    const partesNombre = nombreCompleto.split(' ');

    const nombreDinamico = partesNombre.slice(0, 2).join(' ');
    const apellidoDinamico =
        partesNombre.slice(2).join(' ') || '';

    const matriculaDinamica =
        usuario?.num_control || 'NOM-0012';

    const rolDinamico =
        usuario?.rol || 'Nombrador';

    const formatearFecha = () =>
        fechaActual.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

    const formatearHora = () =>
        fechaActual.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

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

        const existe = catEspecialidades.some(
            (esp) =>
                esp.activo &&
                normalize(esp.nombre) ===
                normalize(busquedaEspecialidad.trim())
        );

        if (existe) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'La especialidad ya existe',
                showConfirmButton: false,
                timer: 2000
            });
            return;
        }

        const nueva = {
            id: Date.now(),
            nombre: busquedaEspecialidad.trim(),
            activo: true
        };

        setCatEspecialidades([
            ...catEspecialidades,
            nueva
        ]);

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
        // tu código actual
    };

    const matches = busquedaEspecialidad.trim()
        ? catEspecialidades.filter(
            (esp) =>
                esp.activo &&
                normalize(esp.nombre).includes(
                    normalize(busquedaEspecialidad.trim())
                )
        )
        : [];

    const existeExacta = catEspecialidades.some(
        (esp) =>
            esp.activo &&
            normalize(esp.nombre) ===
            normalize(busquedaEspecialidad.trim())
    );

    return (
        <>
            <div className="config-header">
                <h1 className={`config-titulo ${esMovil ? 'movil' : ''}`}>
                    Configuración
                </h1>

                <FechaHoraActual />


            </div>

            <div className="config-wrapper">
                <div className={`config-card ${esMovil ? 'movil' : ''}`}>
                    <form onSubmit={handleGuardarGlobal}>

                        {/* PERFIL */}
                        <div className="section-style">
                            <h2 className="section-title">Mi Perfil</h2>
                            <p className="section-subtitle">
                                Información personal sincronizada con tu sesión actual.
                            </p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Nombre(s)</label>
                                    <input
                                        type="text"
                                        value={nombreDinamico}
                                        disabled
                                        className="input-style input-disabled"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Apellidos</label>
                                    <input
                                        type="text"
                                        value={apellidoDinamico}
                                        disabled
                                        className="input-style input-disabled"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Matrícula Institucional
                                    </label>
                                    <input
                                        type="text"
                                        value={matriculaDinamica}
                                        disabled
                                        className="input-style input-disabled"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Rol en el Sistema
                                    </label>
                                    <input
                                        type="text"
                                        value={rolDinamico}
                                        disabled
                                        className="input-style input-disabled"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* REGLAS */}
                        <div className="section-style">
                            <h2 className="section-title">
                                Reglas de Nombramientos
                            </h2>

                            <p className="section-subtitle">
                                Ajusta los parámetros predeterminados para las convocatorias.
                            </p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">
                                        Temporizador Estándar (Minutos)
                                    </label>

                                    <select
                                        value={tiempoConvocatoria}
                                        onChange={(e) =>
                                            setTiempoConvocatoria(e.target.value)
                                        }
                                        className="input-style"
                                    >
                                        <option value="5">5 Minutos</option>
                                        <option value="10">10 Minutos</option>
                                        <option value="15">15 Minutos</option>
                                        <option value="30">30 Minutos</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Filtro de Rango para el Panel Principal
                                    </label>

                                    <select
                                        value={filtroRango}
                                        onChange={(e) =>
                                            setFiltroRango(e.target.value)
                                        }
                                        className="input-style"
                                    >
                                        <option value="1">Hoy (1 día)</option>
                                        <option value="3">Últimos 3 días</option>
                                        <option value="7">Última semana (7 días)</option>
                                        <option value="cerrados">Solo cerrados</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ESPECIALIDADES */}
                        <div className="section-style section-especialidades">
                            <h2 className="section-title">
                                Gestión de Especialidades
                            </h2>

                            <p className="section-subtitle">
                                Busca para dar de baja o escribe para añadir una nueva.
                            </p>

                            <div className="form-group">
                                <label className="form-label">
                                    Buscador / Registro de Especialidad
                                </label>

                                <div className="especialidad-container">
                                    <input
                                        type="text"
                                        placeholder="Ej. Operador de Grúa..."
                                        value={busquedaEspecialidad}
                                        onChange={(e) =>
                                            setBusquedaEspecialidad(e.target.value)
                                        }
                                        className="input-style especialidad-input"
                                    />

                                    {busquedaEspecialidad.trim() !== '' && (
                                        existeExacta ? (
                                            <button
                                                type="button"
                                                onClick={handleBorradoLogico}
                                                className="btn-accion"
                                            >
                                                Dar de baja
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleAgregarEspecialidad}
                                                className="btn-accion"
                                            >
                                                Agregar
                                            </button>
                                        )
                                    )}
                                </div>

                                {matches.length > 0 && (
                                    <ul className="especialidad-lista">
                                        {matches.map((m) => (
                                            <li
                                                key={m.id}
                                                onClick={() =>
                                                    setBusquedaEspecialidad(m.nombre)
                                                }
                                                className="especialidad-item"
                                            >
                                                {m.nombre}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="config-footer">
                            <button
                                type="submit"
                                className="btn-primary"
                            >
                                Guardar Configuración
                            </button>
                        </div>

                    </form>
                </div>
            </div>



        </>
    );
};

export default Configuracion;

