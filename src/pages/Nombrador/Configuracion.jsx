import React, { useState, useEffect } from 'react';


const Configuracion = () => {
    const [esMovil, setEsMovil] = useState(window.innerWidth < 1024);
    const [fechaActual, setFechaActual] = useState(new Date());
    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

    
    const [notifCobertura, setNotifCobertura] = useState(true);
    const [notifVencidos, setNotifVencidos] = useState(true);
    const [notifResumen, setNotifResumen] = useState(false);

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

    const mostrarAlerta = (mensaje, tipo = 'success') => {
        setAlerta({ mostrar: true, mensaje, tipo });
        setTimeout(() => setAlerta({ mostrar: false, mensaje: '', tipo: '' }), 3000);
    };

    const handleGuardarGlobal = (e) => {
        e.preventDefault();
        mostrarAlerta('Configuración global guardada correctamente.');
    };

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

            {/* Contenedor centralizado */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: esMovil ? '25px' : '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', width: '100%', maxWidth: '850px' }}>

                    <form onSubmit={handleGuardarGlobal}>

                        {/* --- SECCIÓN 1: MI PERFIL --- */}
                        <div style={sectionStyle}>
                            <h2 style={sectionTitleStyle}>Mi Perfil</h2>
                            <p style={sectionSubtitleStyle}>Actualiza tu información personal y foto de perfil.</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                                    <img src="/src/assets/imagenes/fotoperfilm.png" alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', color: '#374151', fontWeight: 'bold', margin: '0 0 5px 0' }}>Fotografía del Perfil</p>
                                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '10px' }}>JPG, GIF o PNG. Max 2MB.</span>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <label style={btnOutlineChico}>
                                            Subir nueva foto
                                            <input type="file" accept="image/*" style={{ display: 'none' }} />
                                        </label>
                                        <button type="button" style={{ ...btnOutlineChico, color: '#991b1b', backgroundColor: '#fee2e2', border: '1px solid #fee2e2' }}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>


                            <div style={formGrid}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Nombre(s)</label>
                                    <input type="text" defaultValue="Irving Alejandro" required style={inputStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Apellidos</label>
                                    <input type="text" defaultValue="Juarez Espinosa" required style={inputStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Matrícula Institucional</label>
                                    <input type="text" defaultValue="NOM-0012" disabled style={inputDisabledStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Rol en el Sistema</label>
                                    <input type="text" defaultValue="Jefe de Nombramientos" disabled style={inputDisabledStyle} />
                                </div>
                                <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Correo Electrónico Institucional</label>
                                    <input type="email" defaultValue="irving.juarez@cpv.com.mx" required style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        {/* --- SECCIÓN 2: PREFERENCIAS DE NOTIFICACIONES --- */}
                        <div style={{ ...sectionStyle, borderBottom: 'none', marginBottom: '0', paddingBottom: '0' }}>
                            <h2 style={sectionTitleStyle}>Preferencias de Notificaciones</h2>
                            <p style={sectionSubtitleStyle}>Elige cómo y cuándo quieres recibir alertas del sistema.</p>

                            <div style={switchRowStyle}>
                                <div>
                                    <h4 style={switchTitleStyle}>Alertas de Cobertura de Turnos</h4>
                                    <p style={switchSubtitleStyle}>Recibir un aviso cuando un llamamiento alcance el 100% del cupo.</p>
                                </div>
                                <label style={switchContainerStyle}>
                                    <input type="checkbox" checked={notifCobertura} onChange={() => setNotifCobertura(!notifCobertura)} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={notifCobertura ? sliderCheckedStyle : sliderStyle}>
                                        <span style={notifCobertura ? sliderCircleCheckedStyle : sliderCircleStyle}></span>
                                    </span>
                                </label>
                            </div>

                            <div style={switchRowStyle}>
                                <div>
                                    <h4 style={switchTitleStyle}>Alertas de Cursos Vencidos</h4>
                                    <p style={switchSubtitleStyle}>Notificarme si un trabajador postulado tiene un curso PECS expirado.</p>
                                </div>
                                <label style={switchContainerStyle}>
                                    <input type="checkbox" checked={notifVencidos} onChange={() => setNotifVencidos(!notifVencidos)} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={notifVencidos ? sliderCheckedStyle : sliderStyle}>
                                        <span style={notifVencidos ? sliderCircleCheckedStyle : sliderCircleStyle}></span>
                                    </span>
                                </label>
                            </div>

                            <div style={{ ...switchRowStyle, borderBottom: 'none' }}>
                                <div>
                                    <h4 style={switchTitleStyle}>Resumen Diario por Correo</h4>
                                    <p style={switchSubtitleStyle}>Enviar un reporte en Excel al final del turno con la asistencia.</p>
                                </div>
                                <label style={switchContainerStyle}>
                                    <input type="checkbox" checked={notifResumen} onChange={() => setNotifResumen(!notifResumen)} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={notifResumen ? sliderCheckedStyle : sliderStyle}>
                                        <span style={notifResumen ? sliderCircleCheckedStyle : sliderCircleStyle}></span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* --- BOTÓN FINAL --- */}
                        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                            <button type="submit" style={btnPrimary}>
                                Guardar Configuración
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* ALERTA INTEGRADA */}
            <div style={{
                position: 'fixed', bottom: alerta.mostrar ? '30px' : '-100px', right: '30px',
                backgroundColor: '#122C5F', color: 'white',
                padding: '15px 25px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                transition: 'bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', zIndex: 9999,
                fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
                <span style={{ fontSize: '1.2rem', color: '#4ade80' }}>✓</span> {alerta.mensaje}
            </div>
        </>
    );
};

// --- ESTILOS OFICIALES SGN ---

const sectionStyle = { marginBottom: '35px', paddingBottom: '30px', borderBottom: '2px solid #f3f4f6' };
const sectionTitleStyle = { fontSize: '1.4rem', color: '#122C5F', margin: '0 0 5px 0', fontWeight: 'bold' };
const sectionSubtitleStyle = { fontSize: '0.9rem', color: '#6b7280', margin: '0 0 25px 0' };

const btnPrimary = { backgroundColor: '#1a8a34', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(26,138,52,0.2)', transition: 'transform 0.1s' };

const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' };
const formGroup = { display: 'flex', flexDirection: 'column' };
const labelStyle = { fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '8px' };
const inputStyle = { padding: '12px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', color: '#1f2937', backgroundColor: '#f9fafb' };
const inputDisabledStyle = { ...inputStyle, backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed', border: '1px solid #e5e7eb' };

const switchRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f3f4f6' };
const switchTitleStyle = { fontSize: '1rem', color: '#111827', margin: '0 0 3px 0', fontWeight: 'bold' };
const switchSubtitleStyle = { fontSize: '0.85rem', color: '#6b7280', margin: 0 };

const switchContainerStyle = { position: 'relative', display: 'inline-block', width: '46px', height: '26px' };
const sliderStyle = { position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#d1d5db', transition: '.4s', borderRadius: '26px' };
const sliderCheckedStyle = { ...sliderStyle, backgroundColor: '#4472C4' }; 
const sliderCircleStyle = { position: 'absolute', height: '20px', width: '20px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' };
const sliderCircleCheckedStyle = { ...sliderCircleStyle, transform: 'translateX(20px)' };

const btnOutlineChico = {
    background: 'white', border: '1px solid #d1d5db', color: '#374151', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', display: 'inline-block', whiteSpace: 'nowrap'
};

export default Configuracion;