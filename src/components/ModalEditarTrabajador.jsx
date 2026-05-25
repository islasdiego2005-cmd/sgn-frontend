import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
const ModalEditarTrabajador = ({ isOpen, onClose, trabajador }) => {
    // 15 cursos unificados con los que estás manejando en tus modales
    const cursosDisponibles = [
        "CHOFER ESPECIAL", "BANDERA", "MG", "WINCH", "TRASCAVISTA",
        "GRUA PATO", "TRACKMOBILE", "GARROTERO", "LAVADOR", "REMANZO",
        "CHECADOR", "SUPERVISOR", "OPERADOR GRUA", "MANIOBRISTA", "PORTACALERO"
    ];

    // --- ESTADOS PARA CAPTURAR LOS CAMBIOS ---
    const [nombre, setNombre] = useState('');
    const [estatus, setEstatus] = useState('Apto');
    const [cursosSeleccionados, setCursosSeleccionados] = useState([]);
    const [cargando, setCargando] = useState(false);
    // Cuando el modal se abre con un trabajador, sincronizamos los estados con sus datos actuales
    useEffect(() => {
        if (trabajador) {
            setNombre(trabajador.nombre || '');
            setEstatus(trabajador.estatus || 'Apto');

            if (trabajador.cursos && trabajador.cursos !== 'Ninguno') {
                const cursosArray = trabajador.cursos.split(',').map(c => c.trim());
                setCursosSeleccionados(cursosArray);
            } else {
                setCursosSeleccionados([]);
            }
        }
    }, [trabajador, isOpen]);


    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen || !trabajador) return null;


    const handleCursoToggle = (curso) => {
        setCursosSeleccionados(prev =>
            prev.includes(curso) ? prev.filter(c => c !== curso) : [...prev, curso]
        );
    };

    // --- PETICIÓN PARA GUARDAR EN LA BASE DE DATOS ---
    const handleGuardarCambios = async (e) => {
        e.preventDefault();
        setCargando(true);

        const cursosTexto = cursosSeleccionados.length > 0 ? cursosSeleccionados.join(', ') : 'Ninguno';

        try {
            const respuesta = await axios.put(`http://localhost:5000/api/trabajadores/${trabajador.id}`, {
                nombre_completo: nombre,
                estatus: estatus,
                cursos: cursosTexto
            });


            Swal.fire({
                title: '¡Actualizado!',
                text: respuesta.data.mensaje || "Trabajador modificado correctamente",
                icon: 'success',
                confirmButtonColor: '#122C5F',
                confirmButtonText: 'Aceptar'
            });

            onClose();
        } catch (error) {
            console.error("Error al actualizar:", error);


            Swal.fire({
                title: 'Error',
                text: "No se pudieron guardar los cambios: " + (error.response?.data?.error || error.message),
                icon: 'error',
                confirmButtonColor: '#DC2626'
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div onClick={onClose} style={overlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={modalStyle}>

                {/* Encabezado */}
                <div style={{ position: 'relative', padding: '20px 30px', backgroundColor: '#4472C4' }}>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.2rem', fontWeight: 'bold', paddingRight: '30px' }}>
                        Editar Trabajador: {trabajador.id}
                    </h2>
                    <button onClick={onClose} style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        zIndex: '1000', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '30px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,4b,4b,0.6)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ✕
                    </button>
                </div>

                {/* Cuerpo del Formulario */}
                <div className="modal-scroll-custom" style={{ overflowY: 'auto', padding: '30px', maxHeight: '75vh', backgroundColor: '#f9fafb' }}>
                    <form onSubmit={handleGuardarCambios} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div style={formGrid}>
                            <div>
                                <label style={labelStyle}>Matrícula / ID (No editable)</label>
                                <input type="text" value={trabajador.id} disabled style={{ ...inputStyle, backgroundColor: '#e5e7eb', color: '#6b7280' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nombre Completo</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={formGrid}>
                            <div>
                                <label style={labelStyle}>Departamento</label>
                                <select defaultValue="Operaciones" style={inputStyle}>
                                    <option>Maniobras</option>
                                    <option>Logística</option>
                                    <option>Operaciones</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Estatus</label>
                                <select
                                    value={estatus}
                                    onChange={(e) => setEstatus(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="Apto">Apto</option>
                                    <option value="Próximo a vencer">Próximo a vencer</option>
                                    <option value="Incapacidad">Incapacidad</option>
                                </select>
                            </div>
                        </div>

                        {/* Caja de Checkboxes de Cursos */}
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ color: '#122C5F', fontSize: '1rem', margin: '0 0 15px 0' }}>Actualizar Cursos</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px 16px', marginTop: '15px' }}>
                                {cursosDisponibles.map(curso => {
                                    const isSelected = cursosSeleccionados.includes(curso);
                                    return (
                                        <label
                                            key={curso}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center', // Centra verticalmente el cuadrito con el texto
                                                justifyContent: 'flex-start', // Asegura que todo empiece desde la izquierda
                                                gap: '8px', // Controla el espacio exacto entre el checkbox y el texto
                                                fontSize: '12px',
                                                fontWeight: isSelected ? 'bold' : 'normal',
                                                color: isSelected ? '#4472C4' : '#4b5563',
                                                cursor: 'pointer',
                                                width: '100%' // Asegura que el label tome todo el espacio de su columna
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleCursoToggle(curso)}
                                                style={{
                                                    accentColor: '#4472C4',
                                                    margin: 0,
                                                    width: '16px', // Forza un tamaño estricto para el checkbox
                                                    height: '16px',
                                                    flexShrink: 0 // Evita que el checkbox se aplaste si el texto es largo
                                                }}
                                            />
                                            <span style={{
                                                lineHeight: '1.3',
                                                wordBreak: 'break-word', // Obliga al texto a bajar de línea si no cabe en la columna
                                                textAlign: 'left' // Alinea el texto a la izquierda estrictamente
                                            }}>
                                                {curso}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={onClose} disabled={cargando} style={btnSecundario}>Cancelar</button>
                            <button type="submit" disabled={cargando} style={btnPrimario}>
                                {cargando ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Estilos estáticos
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
const modalStyle = { backgroundColor: 'white', borderRadius: '16px', width: '600px', maxWidth: '90%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e5e7eb' };
const labelStyle = { display: 'block', color: '#4b5563', fontSize: '13px', fontWeight: '600', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontFamily: 'inherit' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '10px' };
const btnPrimario = { padding: '12px 24px', backgroundColor: '#122C5F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const btnSecundario = { padding: '12px 24px', backgroundColor: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default ModalEditarTrabajador;