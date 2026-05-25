import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje }) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }} onClick={onClose}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb', textAlign: 'center' }} onClick={e => e.stopPropagation()}>

              
                <div style={{ color: '#F59E0B', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                    <AlertTriangle size={48} />
                </div>

                <h2 style={{ color: '#122C5F', margin: '0 0 10px 0', fontSize: '1.5rem' }}>{titulo}</h2>
                <p style={{ color: '#4b5563', marginBottom: '25px', fontSize: '0.95rem' }}>{mensaje}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' }}>Cancelar</button>
                    <button onClick={onConfirm} style={{ padding: '10px 20px', border: 'none', background: '#ef4444', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sí, Eliminar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;