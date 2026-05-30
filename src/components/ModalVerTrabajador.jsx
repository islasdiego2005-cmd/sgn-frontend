import React, { useEffect } from 'react';

const ModalVerTrabajador = ({ isOpen, onClose, trabajador }) => {
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen || !trabajador) return null;

    // Colores para el estatus de la empresa (Apto, Incapacidad, Con Acta)
    const colorEstatus = trabajador.estatus === 'Apto' ? '#166534' : trabajador.estatus === 'Incapacidad' ? '#991b1b' : '#c2410c';
    const bgEstatus = trabajador.estatus === 'Apto' ? '#dcfce7' : trabajador.estatus === 'Incapacidad' ? '#fee2e2' : '#ffedd5';

    // --- LÓGICA DE COLORES Y BADGES PARA LA VIGENCIA DE LA CREDENCIAL ---
    const estadoCredencial = trabajador.credencial || 'Vigente';
    const fechaVencimiento = trabajador.fecha_vencimiento || '2026-12-31';

    const getEstiloBadgeCredencial = (estado) => {
        if (estado === 'Vigente') return { bg: '#dcfce7', color: '#15803d' };
        if (estado === 'Próxima a vencer' || estado === 'Próximo a vencer') return { bg: '#ffedd5', color: '#c2410c' };
        if (estado === 'Vencida') return { bg: '#fee2e2', color: '#b91c1c' };
        return { bg: '#e5e7eb', color: '#374151' };
    };

    const estiloCredencial = getEstiloBadgeCredencial(estadoCredencial);

    return (
        <div onClick={onClose} style={overlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
                
                {/* Cabecera con Foto */}
                <div style={{ backgroundColor: '#f9fafb', padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
                    <button onClick={onClose} style={closeBtn}>✕</button>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e5e7eb', margin: '0 auto 15px', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <img src={trabajador.foto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '1.4rem', fontWeight: '700' }}>
                        {trabajador.nombre}
                    </h2>
                    <p style={{ margin: 0, color: '#4b5563', fontWeight: '600', fontSize: '0.95rem' }}>
                        Matrícula: <span style={{ color: '#122C5F' }}>{trabajador.id}</span>
                    </p>
                </div>

                {/* Cuerpo del Modal */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Fila de Estatus Operativo de la Empresa */}
                    <div style={infoRow}>
                        <span style={{ color: '#4b5563', fontWeight: '600' }}>Estatus Laboral:</span>
                        <span style={{ backgroundColor: bgEstatus, color: colorEstatus, padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}>
                            {trabajador.estatus}
                        </span>
                    </div>

                    {/* --- CONTENEDOR VISUAL INYECTADO PARA LA CREDENCIAL --- */}
                    <div style={{ 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '10px', 
                        padding: '14px', 
                        border: '1px solid #e2e8f0',
                        marginTop: '5px',
                        marginBottom: '5px'
                    }}>
                        <div style={{ color: '#1e293b', fontWeight: '700', marginBottom: '10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Vigencia de Credencial
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Estado:</span>
                            <span style={{ 
                                backgroundColor: estiloCredencial.bg, 
                                color: estiloCredencial.color, 
                                padding: '3px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}>
                                {estadoCredencial}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Fecha de Vencimiento:</span>
                            <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '13px' }}>
                                {fechaVencimiento}
                            </span>
                        </div>
                    </div>

                    {/* Sección de Cursos */}
                    <div>
                        <span style={{ display: 'block', color: '#4b5563', fontWeight: '600', marginBottom: '8px' }}>
                            Cursos y Especialidades:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {trabajador.cursos && trabajador.cursos.split(',').map((curso, idx) => (
                                <span key={idx} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {curso.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, opacity: 1 };
const modalStyle = { backgroundColor: 'white', borderRadius: '16px', width: '450px', maxWidth: '90%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e5e7eb' };
const closeBtn = { position: 'absolute', top: '15px', right: '15px', background: '#e5e7eb', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', color: '#4b5563', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const infoRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' };

export default ModalVerTrabajador;