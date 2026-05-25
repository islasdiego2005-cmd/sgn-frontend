import React, { useEffect } from 'react';

const ModalVerTrabajador = ({ isOpen, onClose, trabajador }) => {
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen || !trabajador) return null;

    // Colores para el estatus
    const colorEstatus = trabajador.estatus === 'Apto' ? '#166534' : trabajador.estatus === 'Próximo a vencer' ? '#854d0e' : '#991b1b';
    const bgEstatus = trabajador.estatus === 'Apto' ? '#dcfce7' : trabajador.estatus === 'Próximo a vencer' ? '#fef08a' : '#fee2e2';

    return (
        <div onClick={onClose} style={overlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
                
                {/* Cabecera con Foto */}
                <div style={{ backgroundColor: '#f9fafb', padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
                    <button onClick={onClose} style={closeBtn}>✕</button>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e5e7eb', margin: '0 auto 15px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <img src={trabajador.foto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem' }}>{trabajador.nombre}</h2>
                    <p style={{ margin: '5px 0 0', color: '#6b7280', fontWeight: 'bold' }}>{trabajador.id}</p>
                </div>

                {/* Detalles */}
                <div style={{ padding: '25px 30px' }}>
                    <div style={infoRow}>
                        <span style={infoLabel}>Estatus Actual</span>
                        <span style={{ backgroundColor: bgEstatus, color: colorEstatus, padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            {trabajador.estatus}
                        </span>
                    </div>
                    <div style={infoRow}>
                        <span style={infoLabel}>Departamento</span>
                        <span style={infoValue}>{trabajador.depto || 'Operaciones'}</span>
                    </div>
                    <div style={{ ...infoRow, borderBottom: 'none', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={infoLabel}>Cursos Registrados</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {trabajador.cursos.split(',').map((curso, idx) => (
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

const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, opacity: 1 };
const modalStyle = { backgroundColor: 'white', borderRadius: '16px', width: '450px', maxWidth: '90%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e5e7eb' };
const closeBtn = { position: 'absolute', top: '15px', right: '15px', background: '#e5e7eb', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', color: '#4b5563', fontWeight: 'bold' };
const infoRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #f3f4f6' };
const infoLabel = { color: '#6b7280', fontSize: '0.9rem', fontWeight: '600' };
const infoValue = { color: '#111827', fontWeight: 'bold', fontSize: '0.95rem' };

export default ModalVerTrabajador;