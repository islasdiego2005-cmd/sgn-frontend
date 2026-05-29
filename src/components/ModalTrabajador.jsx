import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Eye, Edit, Trash2, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ModalTrabajador = ({ isOpen, onClose }) => {
    // ESTADOS PARA CAPTURAR LOS INPUTS
    const [numControl, setNumControl] = useState('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [rol, setRol] = useState('Trabajador');

    // LISTA DE CURSOS PORTUARIOS ACTUALIZADA
    const cursosDisponibles = [
        "CHOFER ESPECIAL", "BANDERA", "MG", "WINCH",
        "TRASCAVISTA", "GRUA PATO", "TRACKMOBILE", "GARROTERO",
        "MC CH", "TRINCADOR", "PORTALONERO", "CHOFER GENERAL",
        "CARCHEADOR", "LAVADOR", "SECADOR"
    ];

    const [cursosSeleccionados, setCursosSeleccionados] = useState([]);

    // FUNCIÓN PARA MANDAR LOS DATOS AL BACKEND
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!numControl || !nombreCompleto) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, llena los campos obligatorios.',
                confirmButtonColor: '#122C5F'
            });
            return;
        }

        try {
            const matriculaLimpia = numControl.trim();
            const passwordInicial = `CPV-${matriculaLimpia}`;

            const nuevoUsuario = {
                num_control: matriculaLimpia,
                nombre_completo: nombreCompleto.trim(),
                rol: rol,
                cursos: cursosSeleccionados,
                password: passwordInicial
            };

            await axios.post(`${API_URL}/api/auth/register`, nuevoUsuario);

            onClose();


            await Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: "Trabajador registrado correctamente.",
                confirmButtonColor: '#1a8a34'
            });

            // 3. Eliminamos window.location.reload()


            setNumControl('');
            setNombreCompleto('');
            setCursosSeleccionados([]);

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de registro',
                text: error.response?.data?.error || "No se pudo registrar al trabajador.",
                confirmButtonColor: '#DC2626'
            });
        }
    };
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    const handleCursoToggle = (curso) => {
        setCursosSeleccionados(prev =>
            prev.includes(curso)
                ? prev.filter(c => c !== curso)
                : [...prev, curso]
        );
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.4)', // Oscurecido un poco más para contraste con el blur
                backdropFilter: 'blur(5px)', display: 'flex',
                justifyContent: 'center', alignItems: 'center', zIndex: 9999,
                opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s ease',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'white', borderRadius: '16px', width: '650px',
                    maxWidth: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid #e5e7eb',
                    transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                }}
            >
                {/* --- HEADER DEL MODAL --- */}
                <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ backgroundColor: '#e0e7ff', padding: '8px', borderRadius: '8px', color: '#122C5F' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
                        </div>
                        <h2 style={{ color: '#122C5F', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                            Registrar Trabajador
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'} onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}>
                        ✕
                    </button>
                </div>

                {/* --- CUERPO DEL FORMULARIO --- */}
                <div className="modal-scroll-custom" style={{ overflowY: 'auto', padding: '30px', flex: 1, backgroundColor: '#f9fafb' }}>
                    <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* FOTOGRAFÍA DE PERFIL */}
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                border: '2px dashed #cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9ca3af'
                            }}>

                                <User size={32} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Fotografía del Perfil</label>
                                <input type="file" accept="image/*" style={{ fontSize: '13px', color: '#6b7280', marginTop: '5px' }} />
                            </div>
                        </div>

                        {/* DATOS ESENCIALES (MATRÍCULA Y NOMBRE) */}
                        <div style={formGrid}>
                            <div>
                                <label style={labelStyle}>Matrícula / ID <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="Ej. NOM-0017"
                                    required
                                    value={numControl}
                                    onChange={(e) => setNumControl(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Nombre Completo <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="Ej. Pedro Hernández"
                                    required
                                    value={nombreCompleto}
                                    onChange={(e) => setNombreCompleto(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* SECCIÓN DE CURSOS COMPRENSIVA */}
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ color: '#122C5F', fontSize: '1rem', margin: '0 0 15px 0', borderBottom: '2px solid #e0e7ff', paddingBottom: '10px' }}>Habilidades y Cursos Acreditados</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                                {cursosDisponibles.map(curso => {
                                    const isSelected = cursosSeleccionados.includes(curso);
                                    return (
                                        <label key={curso} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#122C5F' : '#4b5563', cursor: 'pointer', backgroundColor: isSelected ? '#e0e7ff' : '#f9fafb', padding: '8px 10px', borderRadius: '6px', border: isSelected ? '1px solid #c7d2fe' : '1px solid transparent', transition: 'all 0.2s', userSelect: 'none' }}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleCursoToggle(curso)}
                                                style={{ accentColor: '#122C5F', width: '15px', height: '15px' }}
                                            />
                                            {curso}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* BOTONES DE ACCIÓN */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={onClose} style={btnSecundario}>
                                Cancelar
                            </button>
                            <button type="submit" style={btnPrimario}>
                                Guardar Registro
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const labelStyle = { display: 'block', color: '#4b5563', fontSize: '13px', fontWeight: '600', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', backgroundColor: 'white', color: '#1f2937', transition: 'border-color 0.2s' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' };

const btnPrimario = { padding: '12px 24px', backgroundColor: '#1a8a34', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(26, 138, 52, 0.2)' };
const btnSecundario = { padding: '12px 24px', backgroundColor: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'background-color 0.2s' };

export default ModalTrabajador;
