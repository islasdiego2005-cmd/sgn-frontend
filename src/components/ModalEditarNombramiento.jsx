import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ModalEditarNombramiento = ({ isOpen, onClose, nombramiento, fetchNombramientos }) => {
    const [barco, setBarco] = useState('');
    const [muelle, setMuelle] = useState('');
    const [turno, setTurno] = useState('2do Turno (Día)');
    const [fechaCarga, setFechaCarga] = useState('');
    const [fechaCierre, setFechaCierre] = useState('');
    const [cupos, setCupos] = useState({});
    const [cargando, setCargando] = useState(false);
    const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');


    useEffect(() => {

        if (isOpen && nombramiento) {
            try {
                setBarco(nombramiento.barco || nombramiento.nombre_buque || nombramiento.buque || '');
                setMuelle(nombramiento.muelle || '');
                setTurno(nombramiento.turno || nombramiento.titulo || '2do Turno (Día)');

                
                const procesarFecha = (f) => {
                    if (!f) return '';
                    try {
                        const str = String(f);
                        if (str.includes('T')) return str.substring(0, 16);
                        return new Date(str).toISOString().substring(0, 16);
                    } catch (e) {
                        return '';
                    }
                };

                setFechaCarga(procesarFecha(nombramiento.fecha_carga || nombramiento.fecha));
                setFechaCierre(procesarFecha(nombramiento.fecha_cierre));

                // Validación de arreglo de vacantes
                const vacantesRaw = nombramiento.vacantes || [];
                const vacantesSeguras = Array.isArray(vacantesRaw) ? vacantesRaw : [];

                const inicial = {};
                vacantesSeguras.forEach(v => {
                    if (v && (v.puesto || v.nombre)) {
                        const nombrePuesto = v.puesto || v.nombre;
                        inicial[nombrePuesto] = { cantidad: String(v.cantidad || 0) };
                    }
                });
                setCupos(inicial);

            } catch (error) {
                console.error("Error al cargar datos en el Modal:", error);
            }
        }
    }, [nombramiento, isOpen]);

    if (!isOpen) return null;

    
    const cuposValidos = cupos || {};
    const especialidades = Object.keys(cuposValidos).length > 0
        ? Object.keys(cuposValidos)
        : ['CHOFER ESPECIAL', 'BANDERA', 'MG', 'WINCH', 'TRASCAVISTA', 'GRUA PATO'];



    const handleCantidadChange = (especialidad, valor) => {
        if (valor !== '' && Number(valor) < 0) return;
        setCupos(prev => ({ ...prev, [especialidad]: { cantidad: valor } }));
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setCargando(true);

        if (!barco || !muelle || !fechaCarga || !fechaCierre) {
            Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Rellena los campos obligatorios.', confirmButtonColor: '#122C5F', target: 'body' });
            setCargando(false);
            return;
        }

        const vacantes = Object.keys(cuposValidos)
            .filter(k => Number(cuposValidos[k] && cuposValidos[k].cantidad) > 0)
            .map(k => ({ puesto: k, cantidad: parseInt(cuposValidos[k].cantidad, 10) }));

        try {
            const id = nombramiento.id_nombramiento || nombramiento.id;
            const payload = { barco, muelle, turno, fecha_carga: fechaCarga, fecha_cierre: fechaCierre, vacantes };

            const resp = await axios.put(`http://localhost:5000/api/nombramientos/${id}`, payload);

            await Swal.fire({ icon: 'success', title: '¡Actualizado!', text: resp.data?.mensaje || 'Actualizado.', confirmButtonColor: '#122C5F', target: 'body' });
            if (fetchNombramientos) fetchNombramientos();
            onClose();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar.', confirmButtonColor: '#DC2626', target: 'body' });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 700, maxHeight: '92vh', background: '#FFF', borderRadius: 18, overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', border: '1px solid #D9E2F2' }}>
                <div style={{ background: 'linear-gradient(135deg,#0F2B63,#173B82)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#FFF', fontSize: '1.4rem' }}>Editar Nombramiento</h2>
                    <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <div style={{ padding: 20 }}>
                    <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7 }}>Nombre del Buque</label>
                                <input type="text" value={barco} onChange={(e) => setBarco(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7 }}>Muelle</label>
                                <input type="text" value={muelle} onChange={(e) => setMuelle(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7 }}>Apertura</label>
                                <input type="datetime-local" value={fechaCarga} onChange={(e) => setFechaCarga(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7 }}>Cierre</label>
                                <input type="datetime-local" value={fechaCierre} onChange={(e) => setFechaCierre(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: 14, marginBottom: 8 }}>Cupos Especialidad</h3>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                <input
                                    type="text"
                                    placeholder="Nueva especialidad..."
                                    value={nuevaEspecialidad}
                                    onChange={(e) => setNuevaEspecialidad(e.target.value)}
                                    style={{
                                        flex: 1, 
                                        padding: '0 8px',
                                        borderRadius: 8,
                                        border: '1px solid #CBD5E1',
                                        outline: 'none'
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const nom = nuevaEspecialidad.trim().toUpperCase();
                                        if (!nom) return;

                                        if (cuposValidos[nom]) {
                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Ya existe',
                                                text: 'Esa especialidad ya fue agregada.',
                                                confirmButtonColor: '#122C5F',
                                                target: 'body'
                                            });
                                            return;
                                        }

                                        setCupos(prev => ({
                                            ...prev,
                                            [nom]: { cantidad: '' }
                                        }));
                                        setNuevaEspecialidad('');
                                    }}
                                    style={{
                                        flexShrink: 0, 
                                        width: '100px', 
                                        padding: '10px 0', 
                                        background: '#4472C4',
                                        color: '#FFF',
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        textAlign: 'center' 
                                    }}
                                >
                                    Añadir
                                </button>
                            </div>

                            <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                                {especialidades.map((esp) => {
                                    const cantidad = cuposValidos[esp] ? cuposValidos[esp].cantidad : '';
                                    return (
                                        <div key={esp} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid #F1F5F9' }}>
                                            <span style={{ fontWeight: 600 }}>{esp}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <input type="number" min="0" value={cantidad} onChange={(e) => handleCantidadChange(esp, e.target.value)} style={{ width: 80, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1' }} />
                                                <button type="button" onClick={() => { const copy = { ...cuposValidos }; delete copy[esp]; setCupos(copy); }} style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button type="button" onClick={onClose} style={{ padding: '12px 20px', borderRadius: 8, border: 'none', background: '#6B7280', color: '#FFF', cursor: 'pointer' }}>Cerrar</button>
                            <button type="submit" disabled={cargando} style={{ padding: '12px 20px', borderRadius: 8, background: '#122C5F', color: '#FFF', border: 'none', fontWeight: 700 }}>{cargando ? 'Guardando...' : 'Guardar'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarNombramiento;