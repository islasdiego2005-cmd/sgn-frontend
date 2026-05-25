import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModalVerDetalleN = ({ isOpen, onClose, nombramiento }) => {
    const [postulados, setPostulados] = useState([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (isOpen && nombramiento) {
            obtenerPostulados();
        }
    }, [isOpen, nombramiento]);

    const obtenerPostulados = async () => {
        setCargando(true);
        try {
            const id = nombramiento.id_nombramiento || nombramiento.id || nombramiento.idNombramiento;
            const resp = await axios.get(`http://localhost:5000/api/nombramientos/${id}/postulados`);
            setPostulados(resp.data || []);
        } catch (err) {
            console.error('Error obteniendo postulados:', err);
            setPostulados([]);
        } finally {
            setCargando(false);
        }
    };

    if (!isOpen) return null;

    const vacantesStr = (nombramiento?.vacantes || nombramiento?.raw?.vacantes || [])
        .map(v => `${v.puesto || v.puesto_requerido || v.nombre_puesto || v.nombre}: ${v.cantidad || 0}`)
        .join(' | ');

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
            <div style={{ width: '92%', maxWidth: '780px', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(2,6,23,0.2)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#122C5F', color: 'white', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #4472C4' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#4472C4' }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Detalle de Nombramiento</h3>
                            <div style={{ fontSize: '0.85rem', color: '#D1D5DB' }}>{nombramiento?.codigo_nombramiento || nombramiento?.folio}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,4b,4b,0.6)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ padding: '12px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #EEF2FF' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 220px' }}><strong style={{ color: '#122C5F' }}>Código:</strong> <div style={{ marginTop: 6 }}>{nombramiento?.codigo_nombramiento || nombramiento?.folio}</div></div>
                        <div style={{ flex: '1 1 220px' }}><strong style={{ color: '#122C5F' }}>Buque:</strong> <div style={{ marginTop: 6 }}>{nombramiento?.barco || nombramiento?.buque || nombramiento?.nombre_buque || nombramiento?.buque}</div></div>
                        <div style={{ flex: '1 1 160px' }}><strong style={{ color: '#122C5F' }}>Turno:</strong> <div style={{ marginTop: 6 }}>{nombramiento?.turno || nombramiento?.titulo}</div></div>
                        <div style={{ flex: '1 1 160px' }}><strong style={{ color: '#122C5F' }}>Fecha carga:</strong> <div style={{ marginTop: 6 }}>{nombramiento?.fecha_carga || nombramiento?.raw?.fecha_carga || nombramiento?.fecha || 'S/F'}</div></div>
                        <div style={{ flex: '1 1 160px' }}><strong style={{ color: '#122C5F' }}>Fecha cierre:</strong> <div style={{ marginTop: 6 }}>{nombramiento?.fecha_cierre || nombramiento?.raw?.fecha_cierre || '-'}</div></div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <strong style={{ color: '#122C5F' }}>Vacantes:</strong>
                        <div style={{ marginTop: 6, color: '#334155' }}>{vacantesStr || 'N/A'}</div>
                    </div>
                </div>

                <div style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', flex: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#122C5F' }}>Postulados</h4>

                    {cargando ? (
                        <div style={{ padding: 12, color: '#64748B' }}>Cargando postulados...</div>
                    ) : postulados.length === 0 ? (
                        <div style={{ padding: 12, color: '#64748B' }}>No hay postulados para este nombramiento.</div>
                    ) : (
                        <div style={{ maxHeight: '46vh', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#E6EEF9' }}>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', color: '#122C5F' }}>Matrícula</th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', color: '#122C5F' }}>Trabajador</th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', color: '#122C5F' }}>Puesto</th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', color: '#122C5F' }}>Hora</th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', color: '#122C5F' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {postulados.map((p, i) => (
                                        <tr key={p.id_postulacion || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '10px', color: '#0F172A', fontWeight: 600 }}>{p.num_control}</td>
                                            <td style={{ padding: '10px', color: '#334155' }}>{p.nombre_completo}</td>
                                            <td style={{ padding: '10px', color: '#334155' }}>{Array.isArray(p.puesto_requerido) ? p.puesto_requerido.join(', ') : p.puesto_requerido}</td>
                                            <td style={{ padding: '10px', color: '#475569' }}>{p.fecha_postulacion ? new Date(p.fecha_postulacion).toLocaleString('es-MX') : ''}</td>
                                            <td style={{ padding: '10px' }}>{p.resultado || ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div style={{ padding: '10px 16px', backgroundColor: '#fff', borderTop: '1px solid #EEF2FF', textAlign: 'right' }}>
                    <button onClick={onClose} style={{ backgroundColor: '#4472C4', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalVerDetalleN;
