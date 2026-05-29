import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import ModalTrabajador from '../../components/ModalTrabajador';
import ModalEditarTrabajador from '../../components/ModalEditarTrabajador';
import ModalVerTrabajador from '../../components/ModalVerTrabajador';
import ModalConfirmacion from '../../components/ModalConfirmacion';
const API_URL = import.meta.env.VITE_API_URL;
const Trabajadores = () => {
    const [esMovil, setEsMovil] = useState(window.innerWidth < 1024);
    const [fechaActual, setFechaActual] = useState(new Date());

    const [busqueda, setBusqueda] = useState('');
    const [filtroEstatus, setFiltroEstatus] = useState('Todos');
    const [filtroCurso, setFiltroCurso] = useState('Todos');
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalVer, setModalVer] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);


    const [seleccionado, setSeleccionado] = useState(null);

    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

    useEffect(() => {
        const handleResize = () => setEsMovil(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setFechaActual(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const fechaFormateada = fechaActual.toLocaleDateString('es-MX', opcionesFecha);
    const horaFormateada = fechaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const [trabajadores, setTrabajadores] = useState([]);

    useEffect(() => {
        const obtenerTrabajadores = async () => {
            try {
                //  Apuntamos a la ruta correcta de trabajadores
                const respuesta = await axios.get(`${API_URL}/api/trabajadores`);
                // Mapeamos los campos reales usando los nombres que devuelve tu consulta SQL
                const datosFormateados = respuesta.data.map(u => ({
                    foto: '/src/assets/imagenes/user.png',
                    id: u.num_control || 'S/N',            // Mapea num_control
                    nombre: u.nombre_completo || 'Sin Nombre', // Mapea nombre_completo
                    cursos: u.cursos || 'Ninguno',         // Lee los cursos dinámicos de la BD
                    estatus: u.estatus || 'Apto'           // Lee el estatus dinámico de la BD
                }));

                setTrabajadores(datosFormateados);
            } catch (error) {
                console.error("Error al conectar con el backend:", error);
                mostrarAlerta("No se pudo conectar con el servidor", "error");
            }
        };

        obtenerTrabajadores();
        // Agregamos una pequeña dependencia para que se actualice al abrir/cerrar modales si se requiere
    }, [modalAgregar, modalEditar, modalEliminar]);
    const trabajadoresFiltrados = trabajadores.filter((t) => {
        const coincideBusqueda = t.nombre.toLowerCase().includes(busqueda.toLowerCase()) || t.id.toLowerCase().includes(busqueda.toLowerCase());
        const coincideEstatus = filtroEstatus === 'Todos' || t.estatus === filtroEstatus;
        const coincideCurso = filtroCurso === 'Todos' || t.cursos.includes(filtroCurso);
        return coincideBusqueda && coincideEstatus && coincideCurso;
    });

    const mostrarAlerta = (mensaje, tipo = 'info') => {
        setAlerta({ mostrar: true, mensaje, tipo });
        setTimeout(() => setAlerta({ mostrar: false, mensaje: '', tipo: '' }), 3000);
    };

    const abrirVer = (t) => { setSeleccionado(t); setModalVer(true); };
    const abrirEditar = (t) => { setSeleccionado(t); setModalEditar(true); };
    const abrirEliminar = (t) => { setSeleccionado(t); setModalEliminar(true); };

    const confirmarBaja = async () => {
        if (!seleccionado) return;

        try {
            // Llamada al backend para eliminar de la BD

            await axios.delete(`${API_URL}/api/trabajadores/${seleccionado.id}`);
            //  Si la petición fue exitosa, actualizamos la interfaz localmente
            const nuevaLista = trabajadores.filter(t => t.id !== seleccionado.id);
            setTrabajadores(nuevaLista);

            // Cerramos modal y avisamos
            setModalEliminar(false);
            mostrarAlerta(`Trabajador ${seleccionado.nombre} eliminado.`, 'info');
        } catch (error) {
            console.error("Error al eliminar el trabajador:", error);
            mostrarAlerta("No se pudo eliminar el trabajador de la base de datos.", "error");
        }
    };

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                marginBottom: '20px',
                paddingLeft: '25px',
                paddingRight: '25px',
                boxSizing: 'border-box'
            }}>
                {/* Título */}
                <h1 style={{
                    fontSize: esMovil ? '1.5rem' : '2rem',
                    color: '#122C5F',
                    margin: 0,
                    fontWeight: 'bold'
                }}>
                    Trabajadores
                </h1>


                <div style={{
                    textAlign: 'right',
                    color: '#717171',
                    fontSize: esMovil ? '0.8rem' : '1rem',
                    fontWeight: '600'
                }}>
                    <div style={{ textTransform: 'capitalize', lineHeight: '1.2' }}>
                        {fechaFormateada}
                    </div>
                    <span style={{
                        fontSize: esMovil ? '1rem' : '1.2rem',
                        color: '#122C5F',
                        display: 'block',
                        fontWeight: 'bold',
                        marginTop: '2px'
                    }}>
                        {horaFormateada}
                    </span>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap', minWidth: '300px' }}>
                        <input type="text" placeholder="Buscar matrícula o nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ flex: 1, minWidth: '180px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem' }} />
                        <select value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', backgroundColor: 'white', cursor: 'pointer' }}>
                            <option value="Todos">Todos los estatus</option>
                            <option value="Apto">Apto</option>
                            <option value="Próximo a vencer">Próximo a vencer</option>
                            <option value="Incapacidad">Incapacidad</option>
                        </select>
                        <select value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', backgroundColor: 'white', cursor: 'pointer' }}>
                            <option value="Todos">Todos los cursos</option>
                            <option value="CHOFER ESPECIAL">Chofer Especial</option>
                            <option value="MG">MG</option>
                            <option value="GARROTERO">Garrotero</option>
                            <option value="WINCH">Winch</option>
                            <option value="BANDERA">Bandera</option>
                        </select>
                    </div>

                    <button onClick={() => setModalAgregar(true)} style={{ backgroundColor: '#1a8a34', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(26,138,52,0.2)', whiteSpace: 'nowrap' }}>
                        <span>+</span> Añadir Trabajador
                    </button>
                </div>

                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                                <th style={{ padding: '10px', width: '50px' }}>Foto</th>
                                <th style={{ padding: '10px', width: '100px' }}>Matrícula</th>
                                <th style={{ padding: '10px' }}>Nombre</th>
                                <th style={{ padding: '10px', maxWidth: '150px' }}>Cursos</th>
                                <th style={{ padding: '10px', width: '120px' }}>Estatus</th>
                                <th style={{ padding: '10px', textAlign: 'center', width: '150px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trabajadoresFiltrados.length > 0 ? (
                                trabajadoresFiltrados.map((t, idx) => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                                        <td style={{ padding: '6px 10px' }}><div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e7eb', overflow: 'hidden' }}><img
                                            src={t.foto || fotoPerfil} // Si t.foto existe, úsala; si no, usa la foto por defecto que importaste
                                            alt="foto"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        /></div></td>
                                        <td style={{ padding: '10px', color: '#4b5563', fontWeight: '600' }}>{t.id}</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#111827' }}>{t.nombre}</td>
                                        <td style={{ padding: '10px', color: '#6b7280' }}><div style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.cursos}>{t.cursos}</div></td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: t.estatus === 'Apto' ? '#dcfce7' : t.estatus === 'Próximo a vencer' ? '#fef08a' : '#fee2e2', color: t.estatus === 'Apto' ? '#166534' : t.estatus === 'Próximo a vencer' ? '#854d0e' : '#991b1b' }}>{t.estatus}</span>
                                        </td>
                                        <td style={{ padding: '10px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                            <button onClick={() => abrirVer(t)} style={btnAccion('#e0e7ff', '#3730a3')} title="Ver Detalles">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => abrirEditar(t)} style={btnAccion('#dcfce7', '#166534')} title="Editar">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => abrirEliminar(t)} style={btnAccion('#fee2e2', '#991b1b')} title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No hay resultados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            <div style={{
                position: 'fixed', bottom: alerta.mostrar ? '20px' : '-100px', right: '20px',
                backgroundColor: alerta.tipo === 'error' ? '#fee2e2' : '#122C5F',
                color: alerta.tipo === 'error' ? '#991b1b' : 'white',
                padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'bottom 0.3s ease', zIndex: 9999, fontWeight: 'bold', fontSize: '0.9rem',
                border: alerta.tipo === 'error' ? '1px solid #f87171' : 'none'
            }}>
                {alerta.mensaje}
            </div>

            <ModalTrabajador isOpen={modalAgregar} onClose={() => setModalAgregar(false)} />
            <ModalEditarTrabajador isOpen={modalEditar} onClose={() => setModalEditar(false)} trabajador={seleccionado} />
            <ModalVerTrabajador isOpen={modalVer} onClose={() => setModalVer(false)} trabajador={seleccionado} />
            <ModalConfirmacion
                isOpen={modalEliminar}
                onClose={() => setModalEliminar(false)}
                onConfirm={confirmarBaja}
                titulo="¿Eliminar Trabajador?"
                mensaje={`Estás a punto de eliminar a ${seleccionado?.nombre} (${seleccionado?.id}). Esta acción no se puede deshacer.`}
            />
        </>
    );
};

const btnAccion = (bg, color) => ({ background: bg, color: color, border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' });
const btnPaginacion = { background: 'white', border: '1px solid #d1d5db', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' };

export default Trabajadores;