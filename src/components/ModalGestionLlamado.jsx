import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
const ModalGestionLlamado = ({
    isOpen,
    onClose,
    postulados,
    buque,
    nombramiento
}) => {

    const [asignaciones, setAsignaciones] = useState({});
    const [seleccionados, setSeleccionados] = useState({});
    const [trabajadoresExtra, setTrabajadoresExtra] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);

    const postuladosAgrupados = postulados.reduce((acc, current) => {

        const trabajadorExistente = acc.find(
            item => item.num_control === current.num_control
        );

        if (!trabajadorExistente) {

            acc.push({
                ...current,
                todos_los_puestos: [current.puesto_requerido],
                id_postulaciones: [current.id_postulacion]
            });

        } else {

            if (
                !trabajadorExistente.todos_los_puestos.includes(
                    current.puesto_requerido
                )
            ) {
                trabajadorExistente.todos_los_puestos.push(
                    current.puesto_requerido
                );
            }

            trabajadorExistente.id_postulaciones.push(
                current.id_postulacion
            );
        }

        return acc;

    }, []);

    useEffect(() => {

        const cargarAutomatico = async () => {

            try {

                const id = nombramiento?.id_nombramiento;

                if (!id) return;

                // TRAER EXTRAS
                const resExtras = await axios.get(
                    `http://localhost:5000/api/trabajadores/no-postulados/${id}`
                );

                setTrabajadoresExtra(resExtras.data);

                if (postuladosAgrupados.length === 0) return;

                const nuevasAsignaciones = {};
                const nuevosSeleccionados = {};

                // CONTADOR
                const ocupados = {};

                solicitudes.forEach(s => {
                    ocupados[s.nombre_especialidad] = 0;
                });

                // AUTOSELECCIONAR POSTULADOS
                postuladosAgrupados.forEach(trabajador => {

                    const puestoDisponible =
                        trabajador.todos_los_puestos.find(puesto => {

                            const solicitud = solicitudes.find(
                                s => s.nombre_especialidad === puesto
                            );

                            if (!solicitud) return false;

                            return ocupados[puesto] < solicitud.cantidad;
                        });

                    if (puestoDisponible) {

                        nuevasAsignaciones[trabajador.num_control] =
                            puestoDisponible;

                        nuevosSeleccionados[trabajador.num_control] = true;

                        ocupados[puestoDisponible]++;
                    }
                });

                setAsignaciones(nuevasAsignaciones);
                setSeleccionados(nuevosSeleccionados);

            } catch (err) {

                console.error(err);

            }
        };

        if (solicitudes.length > 0) {
            cargarAutomatico();
        }

    }, [solicitudes]);

    // REQUERIMIENTOS DINÁMICOS DEL NOMBRAMIENTO
    // 1. CORRECCIÓN: Calcular requerimientos directamente desde el estado sólido de solicitudes
    const requerimientos = solicitudes.reduce((acc, item) => {
        if (item.cantidad > 0) {
            acc[item.nombre_especialidad] = item.cantidad;
        }
        return acc;
    }, {});


    // 2. CORRECCIÓN: Asegurar el cálculo limpio en toggleSeleccion
    const toggleSeleccion = (numControl) => {
        // Buscamos el puesto asignado en el select o el primero disponible por defecto
        const puesto =
            asignaciones[numControl] ||
            trabajadoresFinales.find(
                p => p.num_control === numControl
            )?.todos_los_puestos[0];

        const { cubiertos, totalNecesario } = calcularAvance(puesto);

        // SI VA A ACTIVAR EL CHECKBOX
        if (!seleccionados[numControl]) {
            // Validación matemática segura
            if (Number(cubiertos) >= Number(totalNecesario)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Vacante llena',
                    text: `El puesto ${puesto} ya está completo.`,
                    confirmButtonColor: '#173B82',
                    customClass: {
                        container: 'swal-superior'
                    }
                });
                return; // Frena la ejecución si realmente está lleno
            }
        }

        // Si hay espacio o va a desmarcar, actualiza el estado normalmente
        setSeleccionados(prev => ({
            ...prev,
            [numControl]: !prev[numControl]
        }));
    };


    useEffect(() => {
        const cargarDetalles = async () => {
            try {
                // USAMOS EL ID QUE VIENE EN LA PROP
                const id = nombramiento?.id_nombramiento;
                const res = await axios.get(`http://localhost:5000/api/nombramientos/${id}/detalles`);
                setSolicitudes(res.data);
            } catch (err) {
                console.error("Error al cargar solicitudes:", err);
            }
        };

        if (nombramiento?.id_nombramiento) cargarDetalles();
    }, [nombramiento]);



    const postuladosSeleccionados = postuladosAgrupados.filter(
        p => seleccionados[p.num_control]
    );

    const postuladosNoSeleccionados = postuladosAgrupados.filter(
        p => !seleccionados[p.num_control]
    );

    const extras = trabajadoresExtra.map(t => ({
        ...t,
        todos_los_puestos: solicitudes.map(
            s => s.nombre_especialidad
        ),
        esExtra: true
    }));

    const trabajadoresFinales = [

        ...postuladosSeleccionados,

        ...postuladosNoSeleccionados,

        ...extras
    ];

    // CALCULAR AVANCE POR PUESTO
    const calcularAvance = (puesto) => {

        const totalNecesario = requerimientos[puesto] || 0;

        const cubiertos = trabajadoresFinales.filter(p => {

            const puestoAsignado =
                asignaciones[p.num_control] ||
                p.todos_los_puestos?.[0] || '';

            return (
                puestoAsignado === puesto &&
                seleccionados[p.num_control]
            );

        }).length;

        return {
            cubiertos,
            totalNecesario
        };
    };

    const trabajadoresOrdenados = [...trabajadoresFinales].sort((a, b) => {

        const aSel = seleccionados[a.num_control] ? 1 : 0;
        const bSel = seleccionados[b.num_control] ? 1 : 0;

        // Seleccionados primero
        if (aSel !== bSel) {
            return bSel - aSel;
        }

        // Extras abajo
        if (a.esExtra && !b.esExtra) return 1;
        if (!a.esExtra && b.esExtra) return -1;

        return 0;
    });

    if (!isOpen) return null;

    const handleCambioPuesto = (numControl, nuevoPuesto) => {

        setAsignaciones(prev => ({
            ...prev,
            [numControl]: nuevoPuesto
        }));
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 3000
            }}
        >
            <div
                style={{
                    width: '95%',
                    maxWidth: '1150px',
                    maxHeight: '92vh',
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                    border: '1px solid #D9E2F2',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >

                {/* HEADER */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #0F2B63, #173B82)',
                        padding: '24px 30px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '4px solid #3B82F6'
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                color: '#FFFFFF',
                                fontSize: '2rem',
                                fontWeight: '800',
                                letterSpacing: '0.3px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Procesar Llamado: {buque}
                        </h2>

                        <p
                            style={{
                                margin: '8px 0 0 0',
                                color: '#D6E4FF',
                                fontSize: '0.95rem'
                            }}
                        >
                            Gestión y asignación de personal
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255,255,255,0.15)',
                            color: '#FFFFFF',
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: '0.2s ease',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EF4444';
                            e.currentTarget.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* CONTENIDO */}
                <div
                    style={{
                        display: 'flex',
                        gap: '24px',
                        padding: '25px',
                        overflow: 'hidden',
                        flex: 1
                    }}
                >

                    {/* TABLA */}
                    <div
                        style={{
                            flex: 3,
                            background: '#FFFFFF',
                            borderRadius: '14px',
                            border: '1px solid #E2E8F0',
                            overflow: 'hidden',
                            boxShadow: '0 4px 14px rgba(15, 43, 99, 0.08)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >

                        <div
                            style={{
                                overflowY: 'auto',
                                overflowX: 'auto',
                                maxHeight: '480px',
                                width: '100%'
                            }}
                        >
                            <table
                                style={{
                                    width: '100%',
                                    minWidth: '850px',
                                    borderCollapse: 'collapse'
                                }}
                            >
                                <thead
                                    style={{
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 10
                                    }}
                                >
                                    <tr
                                        style={{
                                            background: '#F1F5F9',
                                            borderBottom: '2px solid #CBD5E1'
                                        }}
                                    >
                                        <th style={thStyleCenter}>No</th>
                                        <th style={thStyleLeft}>Matrícula</th>
                                        <th style={thStyleLeft}>Nombre</th>
                                        <th style={thStyleLeft}>Puesto Asignado</th>
                                        <th style={thStyleCenter}>Seleccionar</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {trabajadoresOrdenados.map((p, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                background: p.esExtra ? '#FEF9C3' : '#FFFFFF',
                                                borderBottom: '1px solid #E2E8F0',
                                                transition: '0.2s ease'

                                            }}

                                        >
                                            <td style={tdCenter}>
                                                {index + 1}
                                            </td>

                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    fontWeight: '700',
                                                    color: '#0F172A'
                                                }}
                                            >
                                                {p.num_control}
                                            </td>

                                            <td style={tdStyle}>
                                                {p.nombre_completo}

                                                {p.esExtra && (
                                                    <span
                                                        style={{
                                                            marginLeft: '10px',
                                                            background: '#F59E0B',
                                                            color: '#FFFFFF',
                                                            padding: '3px 8px',
                                                            borderRadius: '999px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700'
                                                        }}
                                                    >
                                                        EXTRA
                                                    </span>
                                                )}
                                            </td>

                                            <td style={tdStyle}>
                                                <select
                                                    value={
                                                        asignaciones[p.num_control] ||
                                                        p.todos_los_puestos?.[0] || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleCambioPuesto(
                                                            p.num_control,
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        borderRadius: '10px',
                                                        border: '1px solid #CBD5E1',
                                                        background: '#FFFFFF',
                                                        fontWeight: '600',
                                                        color: '#334155',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {p.todos_los_puestos.map((puesto) => (
                                                        <option
                                                            key={puesto}
                                                            value={puesto}
                                                        >
                                                            {puesto}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            <td style={tdCenter}>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        !!seleccionados[p.num_control]
                                                    }
                                                    onChange={() =>
                                                        toggleSeleccion(
                                                            p.num_control
                                                        )
                                                    }
                                                    style={{
                                                        transform: 'scale(1.35)',
                                                        cursor: 'pointer',
                                                        accentColor: '#173B82'
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PANEL LATERAL CONTENEDOR PRINCIPAL (ESTÁTICO) */}
                    <div
                        style={{
                            flex: 1,
                            background: '#F8FAFC',
                            borderRadius: '16px',
                            border: '1px solid #D9E2F2',
                            padding: '22px',
                            maxHeight: '480px',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 14px rgba(15, 43, 99, 0.08)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Título estático, nunca se moverá */}
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: '18px',
                                color: '#173B82',
                                fontSize: '1.15rem',
                                fontWeight: '800',
                                borderBottom: '2px solid #D6E4FF',
                                paddingBottom: '12px'
                            }}
                        >
                            Solicitudes
                        </h3>

                        {/* SUB-CONTENEDOR INTERNO PARA LAS TARJETAS (ESTE SÍ LLEVA EL SCROLL) */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                overflowX: 'hidden',
                                paddingRight: '4px'
                            }}
                        >
                            {/* Aquí va tu mapeo actual: (solicitudes.length > 0 ? solicitudes : ...) */}
                            {(solicitudes.length > 0 ? solicitudes : Object.keys(requerimientos)).length > 0 ? (
                                (solicitudes.length > 0 ? solicitudes : Object.keys(requerimientos)).map((item) => {
                                    const puestoNombre = item.nombre_especialidad || item;
                                    const totalNecesario = item.cantidad !== undefined ? item.cantidad : (requerimientos[item] || 0);
                                    const { cubiertos } = calcularAvance(puestoNombre);

                                    return (
                                        <div
                                            key={puestoNombre}
                                            style={{
                                                background: '#FFFFFF',
                                                borderRadius: '12px',
                                                padding: '14px',
                                                marginBottom: '10px',
                                                border: '1px solid #E2E8F0',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ fontWeight: '700', color: '#334155', fontSize: '0.95rem' }}>
                                                {puestoNombre}
                                            </span>
                                            <span
                                                style={{
                                                    background: cubiertos < totalNecesario ? '#FEE2E2' : '#DCFCE7',
                                                    color: cubiertos < totalNecesario ? '#DC2626' : '#059669',
                                                    padding: '6px 12px',
                                                    borderRadius: '999px',
                                                    fontWeight: '800',
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {cubiertos}/{totalNecesario}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                                    No hay requerimientos definidos.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div
                    style={{
                        padding: '22px 28px',
                        background: '#F8FAFC',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '15px'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: '13px 26px',
                            borderRadius: '12px',
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            color: '#475569',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                // Obtener trabajadores seleccionados
                                const trabajadoresSeleccionados = trabajadoresFinales
                                    .filter(p => seleccionados[p.num_control])
                                    .map(p => ({
                                        num_control: p.num_control,
                                        puesto: asignaciones[p.num_control] || p.todos_los_puestos?.[0] || ''
                                    }));

                                if (trabajadoresSeleccionados.length === 0) {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Sin selección',
                                        text: 'Por favor, selecciona al menos un trabajador para procesar.',
                                        confirmButtonColor: '#122C5F',
                                        customClass: {
                                            container: 'swal-superior'
                                        }
                                    });
                                    return;
                                }

                                // Enviar al backend
                                await axios.put('http://localhost:5000/api/postulaciones/resultado', {
                                    id_nombramiento: nombramiento?.id_nombramiento, // <--- MANDAMOS EL ID DIRECTO
                                    seleccionados: trabajadoresSeleccionados
                                });
                                
                                // --- ALERTA DE ÉXITO ---
                                await Swal.fire({
                                    icon: 'success',
                                    title: '¡Procesado!',
                                    text: 'Llamado procesado correctamente.',
                                    confirmButtonColor: '#122C5F',
                                    customClass: {
                                        container: 'swal-superior'
                                    }
                                });

                                onClose();

                            } catch (err) {
                                console.error(err);

                                // --- ALERTA DE ERROR ---
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Error al guardar resultados. Inténtalo de nuevo.',
                                    confirmButtonColor: '#DC2626',
                                    customClass: {
                                        container: 'swal-superior'
                                    }
                                });
                            }
                        }}
                        style={{
                            padding: '13px 28px',
                            borderRadius: '12px',
                            border: 'none',
                            background:
                                'linear-gradient(135deg, #12306B, #1E4FAF)',
                            color: '#FFFFFF',
                            fontWeight: '800',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow:
                                '0 8px 18px rgba(30,79,175,0.35)'
                        }}
                    >
                        Confirmar Selección
                    </button>
                </div>
            </div>
        </div>
    );
};

const thStyleLeft = {
    padding: '16px',
    textAlign: 'left',
    color: '#1E293B',
    fontSize: '0.95rem',
    fontWeight: '800'
};

const thStyleCenter = {
    padding: '16px',
    textAlign: 'center',
    color: '#1E293B',
    fontSize: '0.95rem',
    fontWeight: '800'
};

const tdStyle = {
    padding: '16px',
    color: '#334155',
    fontSize: '0.95rem'
};

const tdCenter = {
    padding: '16px',
    textAlign: 'center',
    color: '#334155',
    fontSize: '0.95rem'
};

export default ModalGestionLlamado;

