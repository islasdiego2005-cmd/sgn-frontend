import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Ship, Eye, Clock, CheckCircle, Check } from 'lucide-react';
import ModalNuevoNombramiento from '../../components/ModalNuevoNombramiento';
import ModalPostulados from '../../components/ModalPostulados';
  
const API_URL = import.meta.env.VITE_API_URL;
const PanelPrincipal = () => {

    const [esMovil, setEsMovil] = useState(window.innerWidth < 1024);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [fechaActual, setFechaActual] = useState(new Date());

    const scrollContainerRef = useRef(null);

    const [nombramientos, setNombramientos] = useState([]);
    const [modalPostuladosAbierto, setModalPostuladosAbierto] = useState(false);
    const [nombramientoSeleccionado, setNombramientoSeleccionado] = useState(null);

    // =========================
    // OBTENER NOMBRAMIENTOS
    // =========================

    const fetchNombramientos = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nombramientos`);
            setNombramientos(response.data);
        } catch (error) {
            console.error("Error al obtener los nombramientos:", error);
        }
    };

    // =========================
    // RESPONSIVE
    // =========================

    useEffect(() => {
        const handleResize = () => setEsMovil(window.innerWidth < 1024);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // =========================
    // RELOJ
    // =========================

    useEffect(() => {
        const timer = setInterval(() => setFechaActual(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const fechaFormateada = fechaActual.toLocaleDateString('es-MX', opcionesFecha);
    const horaFormateada = fechaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // =========================
    // CARGAR DATOS
    // =========================

    useEffect(() => {
        fetchNombramientos();
    }, []);

    // =========================
    // SCROLL CARRUSEL
    // =========================

    const scroll = (direccion) => {

        if (scrollContainerRef.current) {

            const cantidadDesplazamiento =
                direccion === 'izquierda'
                    ? -340
                    : 340;

            scrollContainerRef.current.scrollBy({
                left: cantidadDesplazamiento,
                behavior: 'smooth'
            });
        }
    };


    // =========================
    // ESTILOS ESTADOS
    // =========================

    const obtenerEstilosEstado = (estado, fechaCierre) => {
        const ahora = new Date();
        const fin = new Date(fechaCierre);
        const tiempoExpirado = !isNaN(fin) && ahora > fin;

        // 1. PRIORIDAD MÁXIMA: Si el backend ya lo marcó como Publicado (Llamado asignado/concluido)
        if (estado === 'Publicado') {
            return {
                badge: 'Cerrado', // Aquí puedes poner 'Cerrado' o 'Resultados Listos'
                bgColor: '#EAEAEA', // Un gris neutral para procesos terminados
                textColor: '#475569',
                borderColor: '#94A3B8',
                icono: 'checkCircle'
            };
        }

        // 2. Si el backend explícitamente dice Cerrada
        if (estado === 'Cerrada') {
            return {
                badge: 'Cerrado',
                bgColor: '#EAEAEA',
                textColor: '#475569',
                borderColor: '#94A3B8',
                icono: 'reloj'
            };
        }

        // 3. PRIORIDAD SECUNDARIA: Si sigue en "Abierta" o "Configuracion" pero el tiempo ya expiró
        if ((estado === 'Configuracion' || estado === 'Abierta') && tiempoExpirado) {
            return {
                badge: 'En Revisión',
                bgColor: '#FEF3C7',
                textColor: '#92400E',
                borderColor: '#D97706',
                icono: 'reloj'
            };
        }

        // 4. Estados activos (dentro del tiempo límite)
        switch (estado) {
            case 'Configuracion':
            case 'Abierta': // Añadido por si tu backend usa 'Abierta' al crear
                return {
                    badge: 'Postulaciones Activas',
                    bgColor: '#E6F4EA',
                    textColor: '#137333',
                    borderColor: '#1E8E3E',
                    icono: 'check'
                };
            default:
                return {
                    badge: estado || 'Sin Estado',
                    bgColor: '#F1F5F9',
                    textColor: '#334155',
                    borderColor: '#CBD5E1',
                    icono: null
                };
        }
    };
    return (

        <div style={{
            width: '100%',
            overflow: 'hidden'
        }}>

            {/* =========================
               ESTILOS
            ========================== */}

            <style>{`

                .custom-horizontal-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }

                .custom-horizontal-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-horizontal-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }

                .custom-horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* =========================
                   CONTENEDOR CARRUSEL
                ========================== */

                .slider-wrapper {
                    position: relative;
                }

                /* =========================
                   BOTONES FLOTANTES
                ========================== */

                .nav-arrow-btn {

                    position: absolute;

                    /* CENTRADO VERTICAL */
                    top: 46%;

                    transform: translateY(-50%) scale(0.9);

                    width: 58px;
                    height: 58px;

                    border-radius: 50%;

                    border: 1px solid rgba(255,255,255,0.6);

                    background: rgba(255,255,255,0.92);

                    backdrop-filter: blur(10px);

                    color: #122C5F;

                    font-size: 1.7rem;
                    font-weight: bold;

                    cursor: pointer;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    box-shadow:
                        0 8px 25px rgba(0,0,0,0.12),
                        0 2px 8px rgba(0,0,0,0.08);

                    opacity: 0;

                    pointer-events: none;

                    transition:
                        opacity 0.3s ease,
                        transform 0.3s ease,
                        background 0.3s ease,
                        box-shadow 0.3s ease;

                    z-index: 50;
                }

                /* APARECEN AL PASAR EL CURSOR */

                .slider-wrapper:hover .nav-arrow-btn {

                    opacity: 1;

                    pointer-events: auto;

                    transform: translateY(-50%) scale(1);
                }

                /* BOTÓN IZQUIERDO */

                .nav-left {
                    left: 15px;
                }

                /* BOTÓN DERECHO */

                .nav-right {
                    right: 15px;
                }

                /* HOVER */

                .nav-arrow-btn:hover {

                    background: #122C5F;

                    color: white;

                    transform: translateY(-50%) scale(1.12);

                    box-shadow:
                        0 12px 30px rgba(18,44,95,0.35),
                        0 4px 12px rgba(18,44,95,0.25);
                }

                /* CLICK */

                .nav-arrow-btn:active {

                    transform: translateY(-50%) scale(0.96);
                }

            `}</style>

            {/* =========================
               ENCABEZADO
            ========================== */}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
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
                    Panel principal
                </h1>

                {/* Contenedor de Fecha y Hora */}
                <div style={{
                    textAlign: 'right',
                    color: '#717171',
                    fontSize: esMovil ? '0.8rem' : '1rem',
                    fontWeight: '600'
                }}>
                    <div style={{ textTransform: 'capitalize' }}>
                        {fechaActual.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <span style={{
                        fontSize: '1.2rem',
                        color: '#122C5F',
                        fontWeight: 'bold',
                        display: 'block',
                        marginTop: '2px'
                    }}>
                        {fechaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* CONTENEDOR DE TARJETAS */}
            <div className="slider-wrapper" style={{ paddingLeft: '25px', paddingRight: '25px', boxSizing: 'border-box' }}>

                <div ref={scrollContainerRef} className="custom-horizontal-scrollbar" style={{ width: '100%', overflowX: 'auto', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '20px', padding: '10px 5px', width: 'max-content', minHeight: '320px' }}>

                        {/* TARJETA CREAR NUEVO */}
                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', width: '320px', height: '290px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px dashed #756F6F', flexShrink: 0 }}>
                            <h3 style={{ color: '#717171', fontSize: '1.1rem', margin: '0 0 15px 0', fontWeight: '600' }}>Nuevo Nombramiento</h3>
                            <button onClick={() => { setNombramientoSeleccionado(null); setModalAbierto(true); }} style={{ backgroundColor: '#756F6F', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                                <Plus size={20} /> Crear Nombramiento
                            </button>
                        </div>

                        {/* TARJETAS DINÁMICAS */}
                        {nombramientos.map((nom) => {
                            const configVisual = obtenerEstilosEstado(nom.estado, nom.fecha_cierre);
                            return (
                                <div key={nom.id_nombramiento} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', width: '320px', height: '290px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #EAEAEA', borderLeft: `8px solid ${configVisual.borderColor}`, flexShrink: 0 }}>
                                    <div style={{ overflowY: 'auto', maxHeight: '210px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '5px' }}>
                                            <h3 style={{ color: '#122C5F', fontSize: '1.2rem', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Ship size={20} /> {nom.barco}
                                            </h3>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                backgroundColor: configVisual.bgColor,
                                                color: configVisual.textColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {configVisual.icono === 'reloj' && <Clock size={12} />}
                                                {configVisual.icono === 'check' && <Check size={12} />}
                                                {configVisual.icono === 'checkCircle' && <CheckCircle size={12} />}
                                                {configVisual.badge}
                                            </span>
                                        </div>
                                        <p style={{ margin: '15px 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Código: <b>{nom.codigo_nombramiento}</b></p>
                                        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#374151', fontWeight: 'bold' }}>Turno: {nom.turno}</p>
                                    </div>

                                    <button onClick={() => { setNombramientoSeleccionado(nom); setModalPostuladosAbierto(true); }} style={{ backgroundColor: '#122C5F', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Eye size={16} /> {nom.estado === 'Configuracion' ? 'Ver Postulados' : 'Ver Resultados'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* =========================
               MODALES
            ========================== */}

            <ModalNuevoNombramiento
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                fetchNombramientos={fetchNombramientos}
            />

            <ModalPostulados
                isOpen={modalPostuladosAbierto}
                onClose={() => {
                    setModalPostuladosAbierto(false);
                    setNombramientoSeleccionado(null);
                }}
                nombramiento={nombramientoSeleccionado}
                fetchNombramientos={fetchNombramientos}
            />

        </div>
    );
};

export default PanelPrincipal;