import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

import * as XLSX from 'xlsx-js-style';
import { X, Ship, FileSpreadsheet, Edit, Trash2, Megaphone, Clock } from 'lucide-react';
import ModalGestionLlamado from './ModalGestionLlamado';
import ModalEditarNombramiento from './ModalEditarNombramiento';

const ModalPostulados = ({ isOpen, onClose, nombramiento, fetchNombramientos }) => {
    const [postulados, setPostulados] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [tiempoRestante, setTiempoRestante] = useState('');
    const [showLlamadoModal, setShowLlamadoModal] = useState(false);
    const [showEditarModal, setShowEditarModal] = useState(false);

    // --- LOGICA DE CONTROL DE ESTADO ACTIVO ---
    // Evaluamos dinámicamente si la convocatoria sigue abierta basándonos en tiempoRestante
    const esConvocatoriaActiva = tiempoRestante !== 'Convocatoria Cerrada' && !tiempoRestante.includes('Espera');

    //  Cargar postulados al abrir el modal
    useEffect(() => {
        if (isOpen && nombramiento) {
            obtenerPostulados();
        }
    }, [isOpen, nombramiento]);

    // Temporizador dinámico basado en la apertura y cierre del nombramiento
    useEffect(() => {
        if (!isOpen || !nombramiento) return;

        const calcularTiempo = () => {
            const ahora = new Date();

            // Validamos todas las posibles variantes de nombres de columnas que vengan del backend
            const inicioConvocatoria = new Date(nombramiento.fecha_carga);
            const finConvocatoria = new Date(nombramiento.fecha_cierre);

            // Validamos que las fechas sean correctas antes de hacer cálculos matemáticos
            if (isNaN(inicioConvocatoria.getTime()) || isNaN(finConvocatoria.getTime())) {
                setTiempoRestante('Error en formato de fechas');
                return;
            }
            // ESCENARIO 1: La convocatoria aún no empieza
            if (ahora < inicioConvocatoria) {
                setTiempoRestante('Convocatoria en Espera (No ha iniciado)');
                return;
            }

            // Agrupamos las postulaciones por matrícula (num_control)
            const postuladosAgrupados = postulados.reduce((acc, current) => {
                // Buscamos si el trabajador ya existe en nuestro acumulador
                const trabajadorExistente = acc.find(item => item.num_control === current.num_control);

                if (!trabajadorExistente) {
                    // Si es nuevo, lo agregamos y convertimos el puesto en un arreglo
                    acc.push({
                        ...current,
                        puesto_requerido: [current.puesto_requerido]
                    });
                } else {
                    // Si ya existe, agregamos el nuevo puesto al arreglo de puestos
                    if (!trabajadorExistente.puesto_requerido.includes(current.puesto_requerido)) {
                        trabajadorExistente.puesto_requerido.push(current.puesto_requerido);
                    }
                }
                return acc;
            }, []);

            const diferencia = finConvocatoria - ahora;

            // ESCENARIO 3: Ya se pasaron los 20 minutos (o el tiempo asignado)
            if (diferencia <= 0) {
                setTiempoRestante('Convocatoria Cerrada');
            } else {
                // ESCENARIO 2: Convocatoria activa, calculamos minutos y segundos restantes
                const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

               
                const minFormateados = String(minutos).padStart(2, '0');
                const segFormateados = String(segundos).padStart(2, '0');

                setTiempoRestante(`${minFormateados} min ${segFormateados} sg`);
            }
        };

        calcularTiempo();
        const intervalo = setInterval(calcularTiempo, 1000);
        return () => clearInterval(intervalo);
    }, [isOpen, nombramiento]);


    const obtenerPostulados = async () => {
        setCargando(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/nombramientos/${nombramiento.id_nombramiento}/postulados`);
            setPostulados(response.data);
        } catch (error) {
            console.error("Error al obtener los postulados:", error);
        } finally {
            setCargando(false);
        }
    };

    const formatearHora = (fechaStr) => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
            `.${String(fecha.getMilliseconds()).padStart(3, '0')}`;
    };

    const obtenerEstiloResultado = (resultado) => {
    switch (resultado) {
        case 'Aceptado':
            return {
                backgroundColor: '#D1FAE5',
                color: '#065F46'
            };

        case 'Rechazado':
            return {
                backgroundColor: '#FEE2E2',
                color: '#991B1B'
            };

        default:
            return {
                backgroundColor: '#FEF3C7',
                color: '#92400E'
            };
    }
};

    const handleExportarExcel = () => {
        // Preparar datos
        const datosParaExcel = postulados.map(p => ({
            "Matrícula": p.num_control,
            "Trabajador": p.nombre_completo,
            "Puesto Solicitado": p.puesto_requerido,
            "Hora de Entrada": p.fecha_postulacion,
            "Estado": p.resultado
        }));

        // Crear la hoja
        const ws = XLSX.utils.json_to_sheet(datosParaExcel);

        //  Definir estilos para los encabezados
        const estiloEncabezado = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "122C5F" } }, // Tu azul institucional
            alignment: { horizontal: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } }
            }
        };

        // Aplicar estilo a la primera fila (los encabezados)
        const rango = XLSX.utils.decode_range(ws['!ref']);
        for (let C = rango.s.c; C <= rango.e.c; ++C) {
            const celdaDireccion = XLSX.utils.encode_cell({ c: C, r: 0 });
            if (!ws[celdaDireccion]) continue;
            ws[celdaDireccion].s = estiloEncabezado;
        }

        // Ajustar el ancho de las columnas 
        ws['!cols'] = [
            { wch: 15 },
            { wch: 30 },
            { wch: 20 },
            { wch: 30 },
            { wch: 15 }
        ];

        // Crear el libro y agregar la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Postulados");

        //  Descargar
        XLSX.writeFile(wb, `Postulados_${nombramiento.barco || 'Nombramiento'}.xlsx`);
    };

    const handleEditarNombramiento = () => {
        setShowEditarModal(true);
    };

    // FUNCIÓN CONECTADA AL BACKEND PARA ELIMINAR
    const handleEliminarNombramiento = async () => {
        const buqueNombre = nombramiento.barco || nombramiento.buque || nombramiento.nombre_buque || "este buque";

        // --- ALERTA DE CONFIRMACIÓN  ---
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el nombramiento ${nombramiento.codigo_nombramiento} del buque ${buqueNombre}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/nombramientos/${nombramiento.id_nombramiento}`);

                // --- ALERTA DE ÉXITO ---
                Swal.fire({
                    title: '¡Eliminado!',
                    text: response.data.message || "Nombramiento eliminado con éxito.",
                    icon: 'success',
                    confirmButtonColor: '#122C5F'
                });

                if (fetchNombramientos) fetchNombramientos();
                onClose();
            } catch (error) {
                console.error("Error al eliminar el nombramiento:", error);

                // --- ALERTA DE ERROR ---
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.error || "Hubo un error al intentar eliminar.",
                    icon: 'error',
                    confirmButtonColor: '#122C5F'
                });
            }
        }
    };

    // FUNCIÓN CONECTADA AL BACKEND PARA INICIAR EL LLAMADO
    const handleHacerLlamado = () => {
        setShowLlamadoModal(true);
    };

    // Agrupamos las postulaciones por matrícula (num_control)
    const postuladosAgrupados = postulados.reduce((acc, current) => {
        // Buscamos si el trabajador ya existe en nuestro acumulador
        const trabajadorExistente = acc.find(item => item.num_control === current.num_control);

        if (!trabajadorExistente) {
            // Si es nuevo, lo agregamos y convertimos el puesto en un arreglo
            acc.push({
                ...current,
                puesto_requerido: [current.puesto_requerido]
            });
        } else {
            // Si ya existe, agregamos el nuevo puesto al arreglo de puestos
            if (!trabajadorExistente.puesto_requerido.includes(current.puesto_requerido)) {
                trabajadorExistente.puesto_requerido.push(current.puesto_requerido);
            }
        }
        return acc;
    }, []);

    if (!isOpen) return null;

    return (
        <>
            {/* FONDO OSCURO Y CONTENEDOR DEL MODAL PRINCIPAL */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
                justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                backdropFilter: 'blur(2px)'
            }}>
                <div style={{
                    backgroundColor: 'white', borderRadius: '12px', width: '95%', maxWidth: '950px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column',
                    maxHeight: '85vh'
                }}>

                    {/* ENCABEZADO PRINCIPAL ESTILO SGN */}
                    <div style={{
                        backgroundColor: '#122C5F', color: 'white', padding: '18px 25px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderBottom: '4px solid #4472C4'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Ship size={28} />
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                    Control de Postulaciones
                                </h2>
                                <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                                    Buque: {nombramiento?.nombre_buque || nombramiento?.buque || nombramiento?.barco || "No asignado"}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                            width: '36px', height: '36px', borderRadius: '50%',
                            fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,4b,4b,0.6)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            ✕
                        </button>
                    </div>

                    {/* BARRA INFORMATIVA HORIZONTAL */}
                    <div style={{
                        backgroundColor: '#F1F5F9', padding: '15px 25px', borderBottom: '1px solid #E2E8F0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
                    }}>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#334155' }}>
                            <div><strong>Código:</strong> <span style={{ fontFamily: 'monospace', backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{nombramiento.codigo_nombramiento}</span></div>
                            <div><strong>Turno:</strong> {nombramiento.turno}</div>
                            <div><strong>Fecha:</strong> {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        </div>

                        <div style={{
                            backgroundColor: tiempoRestante === 'Convocatoria Cerrada' ? '#FEF2F2' : tiempoRestante.includes('Espera') ? '#FFFBEB' : '#F0FDF4',
                            border: `1px solid ${tiempoRestante === 'Convocatoria Cerrada' ? '#FEE2E2' : tiempoRestante.includes('Espera') ? '#FEF3C7' : '#DCFCE7'}`,
                            padding: '6px 14px',
                            borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <Clock size={18} />
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: tiempoRestante === 'Convocatoria Cerrada' ? '#991B1B' : tiempoRestante.includes('Espera') ? '#92400E' : '#166534'
                            }}>
                                Tiempo restante: <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>{tiempoRestante}</span>
                            </span>
                        </div>
                    </div>

                    {/* ACCIONES DE HERRAMIENTAS */}
                    <div style={{ padding: '15px 25px 0 25px', display: 'flex', gap: '12px' }}>
                        <button onClick={handleExportarExcel} style={{
                            backgroundColor: '#107C41', color: 'white', border: 'none', padding: '8px 14px',
                            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <FileSpreadsheet size={16} /> Exportar a Excel
                        </button>

                        <button onClick={handleEditarNombramiento} disabled={!esConvocatoriaActiva} style={{
                            backgroundColor: esConvocatoriaActiva ? '#4472C4' : '#94A3B8', color: 'white', border: 'none', padding: '8px 14px',
                            borderRadius: '6px', cursor: esConvocatoriaActiva ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '6px', opacity: esConvocatoriaActiva ? 1 : 0.7
                        }}>
                            <Edit size={16} /> Editar Nombramiento
                        </button>

                        <button onClick={handleEliminarNombramiento} style={{
                            backgroundColor: '#DC2626', color: 'white', border: 'none', padding: '8px 14px',
                            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <Trash2 size={16} /> Eliminar Nombramiento
                        </button>
                    </div>

                    {/* CUERPO CENTRAL CON LA TABLA */}
                    <div style={{ padding: '15px 25px 20px 25px', backgroundColor: '#FFFFFF', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '350px' }}>
                            {cargando ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#122C5F', fontWeight: '600' }}>
                                    Cargando postulados en tiempo real...
                                </div>
                            ) : postulados.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px', color: '#64748B', fontStyle: 'italic', backgroundColor: '#F8FAFC', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    Ningún trabajador se ha postulado a este barco todavía en este turno.
                                </div>
                            ) : (
                                <div style={{ overflowY: 'auto', overflowX: 'hidden', height: '100%', backgroundColor: '#FFFFFF' }}>
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', backgroundColor: '#FFFFFF' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#F8FAFC', padding: '14px 10px', width: '12%', textAlign: 'left', color: '#475569', borderBottom: '2px solid #CBD5E1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Matrícula</th>
                                                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#F8FAFC', padding: '14px 10px', width: '32%', textAlign: 'left', color: '#475569', borderBottom: '2px solid #CBD5E1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Trabajador</th>
                                                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#F8FAFC', padding: '14px 10px', width: '24%', textAlign: 'left', color: '#475569', borderBottom: '2px solid #CBD5E1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Puesto Solicitado</th>
                                                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#F8FAFC', padding: '14px 10px', width: '12%', textAlign: 'center', color: '#475569', borderBottom: '2px solid #CBD5E1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {postuladosAgrupados.map((p, index) => (
                                                <tr key={p.id_postulacion || index} style={{ backgroundColor: '#FFFFFF', transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}>
                                                    <td style={{ padding: '14px 10px', borderBottom: '1px solid #E2E8F0', fontWeight: '700', color: '#1E293B' }}>{p.num_control}</td>
                                                    <td style={{ padding: '14px 10px', borderBottom: '1px solid #E2E8F0', color: '#334155', fontWeight: '500' }}>{p.nombre_completo}</td>
                                                    <td style={{ padding: '14px 10px', borderBottom: '1px solid #E2E8F0' }}>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                            {p.puesto_requerido.map((puesto, i) => (
                                                                <span key={i} style={{ backgroundColor: '#E2E8F0', color: '#1E293B', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: '1px solid #CBD5E1' }}>{puesto}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '14px 10px', borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '50px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', ...obtenerEstiloResultado(p.resultado) }}>{p.resultado}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR DE ACCIÓN GLOBAL */}
                    <div style={{ padding: '15px 25px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button onClick={handleHacerLlamado} disabled={esConvocatoriaActiva} style={{
                            backgroundColor: esConvocatoriaActiva ? '#94A3B8' : '#1E3A8A', color: 'white', border: 'none', padding: '10px 22px',
                            borderRadius: '6px', cursor: esConvocatoriaActiva ? 'not-allowed' : 'pointer', fontWeight: '700', display: 'flex',
                            alignItems: 'center', gap: '8px', transition: 'background 0.2s', opacity: esConvocatoriaActiva ? 0.7 : 1
                        }}>
                            <Megaphone size={18} /> Hacer Llamado
                        </button>
                        <button onClick={onClose} style={{
                            backgroundColor: '#64748B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s'
                        }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#64748B'}>
                            Cerrar Ventana
                        </button>
                    </div>
                </div>
            </div>


            <ModalGestionLlamado
                isOpen={showLlamadoModal}
                onClose={() => setShowLlamadoModal(false)}
                postulados={postulados}
                buque={nombramiento?.nombre_buque || nombramiento?.buque || nombramiento?.barco}
                nombramiento={nombramiento}
            />


            {showEditarModal && (
                <ModalEditarNombramiento
                    isOpen={showEditarModal}
                    onClose={() => setShowEditarModal(false)}
                    nombramiento={nombramiento}
                    fetchNombramientos={fetchNombramientos}
                />
            )}
        </>
    );
};

export default ModalPostulados;