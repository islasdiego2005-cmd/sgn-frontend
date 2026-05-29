import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
const API_URL = import.meta.env.VITE_API_URL;
const ModalNuevoNombramiento = ({ isOpen, onClose, fetchNombramientos }) => {

    // =========================
    // ESTADOS
    // =========================
    const [barco, setBarco] = useState('');
    const [muelle, setMuelle] = useState('');
    const [turno, setTurno] = useState('2do Turno (Día)');
    const [fechaCarga, setFechaCarga] = useState('');
    const [fechaCierre, setFechaCierre] = useState('');

    const [cupos, setCupos] = useState({});

    // =========================
    // CERRAR CON ESC
    // =========================
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!isOpen) return null;

    const {
        sectionDivider,
        sectionTitle,
        labelStyle,
        inputStyle,
        formGrid,
        tableContainer,
        tableStyle,
        tableHeaderRow,
        tableHeaderCell,
        tableRow,
        tableCell,
        btnPrimario,
        btnSecundario
    } = estilos;

    // =========================
    // ESPECIALIDADES
    // =========================
    const especialidades = [
        "CHOFER ESPECIAL",
        "BANDERA",
        "MG",
        "WINCH",
        "TRASCAVISTA",
        "GRUA PATO",
        "TRACKMOBILE",
        "GARROTERO",
        "MC CH",
        "TRINCADOR",
        "PORTALONERO",
        "CHOFER GENERAL",
        "CARCHEADOR",
        "LAVADOR",
        "SECADOR"
    ];

    // =========================
    // CAMBIO DE CANTIDAD
    // =========================
    const handleCantidadChange = (especialidad, valor) => {

        // SOLO NÚMEROS
        if (valor !== '' && Number(valor) < 0) return;

        setCupos(prev => ({
            ...prev,
            [especialidad]: {
                cantidad: valor
            }
        }));
    };

    // =========================
    // GUARDAR NOMBRAMIENTO
    // =========================
    const handleGuardarNombramiento = async (e) => {
        e.preventDefault();

        // 1. Validaciones
        if (!barco || !muelle || !fechaCarga || !fechaCierre) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, asegúrate de llenar todos los campos obligatorios.',
                confirmButtonColor: '#122C5F',
                target: 'body',
                customClass: {
    container: 'swal2-container-top',
    popup: 'swal2-popup-top'
  }
            });
            return;
        }

        if (new Date(fechaCierre) <= new Date(fechaCarga)) {
            Swal.fire({
                icon: 'error',
                title: 'Fecha inválida',
                text: 'La fecha de cierre debe ser posterior a la fecha de apertura.',
                confirmButtonColor: '#DC2626',
                target: 'body',
                customClass: {
    container: 'swal2-container-top',
    popup: 'swal2-popup-top'
  }
            });
            return;
        }

        const vacantes = Object.keys(cupos)
            .filter(esp => Number(cupos[esp]?.cantidad) > 0)
            .map(esp => ({
                puesto: esp,
                cantidad: parseInt(cupos[esp].cantidad, 10)
            }));

        if (vacantes.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin especialidades',
                text: 'Debes agregar al menos una especialidad con cupo.',
                confirmButtonColor: '#122C5F',
                target: 'body',
                customClass: {
    container: 'swal2-container-top',
    popup: 'swal2-popup-top'
  }
            });
            return;
        }

        const fechaSoloDia = fechaCarga.split('T')[0];
        const codigo_nombramiento = `NOM-${fechaSoloDia.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

        try {
            const response = await axios.post(`${API_URL}/api/nombramientos/crear`, {
                codigo_nombramiento, barco, turno, fecha_carga: fechaCarga, fecha_cierre: fechaCierre, muelle, vacantes
            });

            // --- ALERTA DE ÉXITO ---
            await Swal.fire({
                icon: 'success',
                title: '¡Nombramiento creado!',
                text: response.data.mensaje || "El proceso se ha completado correctamente.",
                confirmButtonColor: '#1a8a34',
                target: 'body',
                customClass: {
    container: 'swal2-container-top',
    popup: 'swal2-popup-top'
  }
            });

            // Limpiar formulario y cerrar
            setBarco(''); setMuelle(''); setFechaCarga(''); setFechaCierre(''); setCupos({});
            fetchNombramientos();
            onClose();

        } catch (error) {
            console.error(error);

            // --- ALERTA DE ERROR ---
            Swal.fire({
                icon: 'error',
                title: 'Error en servidor',
                text: error.response?.data?.error || "Hubo un problema al crear el nombramiento.",
                confirmButtonColor: '#DC2626',
                target: 'body',
                customClass: {
    container: 'swal2-container-top',
    popup: 'swal2-popup-top'
  }
            });
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.60)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 3000
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '700px',
                    maxHeight: '92vh',
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #D9E2F2'
                }}
            >

                {/* HEADER */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #0F2B63, #173B82)',
                        padding: '22px 28px',
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
                                fontSize: '1.9rem',
                                fontWeight: '800'
                            }}
                        >
                            Nuevo Nombramiento
                        </h2>

                        <p
                            style={{
                                margin: '6px 0 0 0',
                                color: '#D6E4FF',
                                fontSize: '0.92rem'
                            }}
                        >
                            Registro de operación y cupos
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255,255,255,0.15)',
                            color: '#FFFFFF',
                            fontSize: '1.6rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: '0.2s ease'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div
                    className="modal-scroll-custom"
                    style={{
                        overflowY: 'auto',
                        padding: '25px',
                        flex: 1
                    }}
                >

                    <form
                        onSubmit={handleGuardarNombramiento}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '22px'
                        }}
                    >

                        {/* INFORMACIÓN */}
                        <div>

                            <div style={sectionDivider}></div>

                            <h3 style={sectionTitle}>
                                Información de Operación
                            </h3>

                            <div style={formGrid}>

                                <div>
                                    <label style={labelStyle}>
                                        Nombre del Buque
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Ej. Brave Mariner"
                                        style={inputStyle}
                                        value={barco}
                                        onChange={(e) =>
                                            setBarco(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Muelle de Atraque
                                    </label>

                                    <select
                                        style={inputStyle}
                                        value={muelle}
                                        onChange={(e) =>
                                            setMuelle(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Seleccione muelle...
                                        </option>

                                        <option value="Muelle 4 Norte">
                                            Muelle 4 Norte
                                        </option>

                                        <option value="Muelle 2 Este">
                                            Muelle 2 Este
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Tipo de Maniobra
                                    </label>

                                    <select style={inputStyle}>
                                        <option>Carga</option>
                                        <option>Descarga</option>
                                    </select>
                                </div>

                            </div>
                        </div>

                        {/* TABLA CUPOS */}
                        <div>

                            <div style={sectionDivider}></div>

                            <h3 style={sectionTitle}>
                                Cupos por Especialidad
                            </h3>

                            <div style={tableContainer}>

                                <table style={tableStyle}>

                                    <thead>

                                        <tr style={tableHeaderRow}>

                                            <th style={tableHeaderCell}>
                                                Especialidad
                                            </th>

                                            <th style={tableHeaderCell}>
                                                Estado
                                            </th>

                                            <th style={tableHeaderCell}>
                                                Cantidad Requerida
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {especialidades.map((esp, index) => {

                                            const cantidad =
                                                cupos[esp]?.cantidad || "";

                                            const activo =
                                                Number(cantidad) > 0;

                                            return (

                                                <tr
                                                    key={esp}
                                                    style={{
                                                        ...tableRow,

                                                        backgroundColor: activo
                                                            ? '#DCFCE7'
                                                            : index % 2 !== 0
                                                                ? '#f9f9f9'
                                                                : '#FFFFFF',

                                                        transition: '0.2s ease'
                                                    }}
                                                >

                                                    {/* ESPECIALIDAD */}
                                                    <td
                                                        style={{
                                                            ...tableCell,
                                                            fontWeight: activo
                                                                ? 'bold'
                                                                : 'normal',

                                                            color: activo
                                                                ? '#166534'
                                                                : '#333'
                                                        }}
                                                    >
                                                        {esp}
                                                    </td>

                                                    {/* ESTADO */}
                                                    <td style={tableCell}>

                                                        <span
                                                            style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',

                                                                backgroundColor: activo
                                                                    ? '#BBF7D0'
                                                                    : '#F1F5F9',

                                                                color: activo
                                                                    ? '#166534'
                                                                    : '#64748B'
                                                            }}
                                                        >
                                                            {activo
                                                                ? 'Activo'
                                                                : 'Inactivo'}
                                                        </span>

                                                    </td>

                                                    {/* CANTIDAD */}
                                                    <td style={tableCell}>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            value={cantidad}
                                                            onChange={(e) =>
                                                                handleCantidadChange(
                                                                    esp,
                                                                    e.target.value
                                                                )
                                                            }
                                                            style={{
                                                                width: '100px',
                                                                padding: '10px 12px',
                                                                borderRadius: '10px',

                                                                border: activo
                                                                    ? '1px solid #22C55E'
                                                                    : '1px solid #CBD5E1',

                                                                backgroundColor: activo
                                                                    ? '#F0FDF4'
                                                                    : '#FFFFFF',

                                                                color: '#1E293B',
                                                                fontWeight: activo
                                                                    ? 'bold'
                                                                    : 'normal',

                                                                outline: 'none',
                                                                transition: '0.2s ease',
                                                                fontSize: '13px'
                                                            }}
                                                        />

                                                    </td>

                                                </tr>
                                            );
                                        })}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                        {/* FECHAS */}
                        <div>

                            <div style={sectionDivider}></div>

                            <h3 style={sectionTitle}>
                                Vigencia de Convocatoria
                            </h3>

                            <div style={formGrid}>

                                <div>
                                    <label style={labelStyle}>
                                        Apertura
                                    </label>

                                    <input
                                        type="datetime-local"
                                        style={inputStyle}
                                        value={fechaCarga}
                                        onChange={(e) =>
                                            setFechaCarga(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Cierre
                                    </label>

                                    <input
                                        type="datetime-local"
                                        style={inputStyle}
                                        value={fechaCierre}
                                        onChange={(e) =>
                                            setFechaCierre(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Turno Correspondiente
                                    </label>

                                    <select
                                        style={inputStyle}
                                        value={turno}
                                        onChange={(e) =>
                                            setTurno(e.target.value)
                                        }
                                    >
                                        <option value="1er Turno (Noche)">
                                            1er Turno (Noche)
                                        </option>

                                        <option value="2do Turno (Día)">
                                            2do Turno (Día)
                                        </option>
                                    </select>
                                </div>

                            </div>

                        </div>

                        {/* BOTONES */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '14px',
                                marginTop: '10px'
                            }}
                        >

                            <button
                                type="button"
                                onClick={onClose}
                                style={btnSecundario}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                style={btnPrimario}
                            >
                                Guardar Nombramiento
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        </div>
    );
};

// =========================
// ESTILOS
// =========================
const estilos = {

    sectionDivider: {
        height: '3px',
        background: 'linear-gradient(90deg, #12306B, #3B82F6)',
        marginBottom: '10px',
        borderRadius: '20px'
    },

    sectionTitle: {
        color: '#1E293B',
        fontWeight: '800',
        fontSize: '1rem',
        margin: '0 0 15px 0'
    },

    labelStyle: {
        display: 'block',
        color: '#475569',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '7px'
    },

    inputStyle: {
        width: '100%',
        padding: '11px 14px',
        borderRadius: '10px',
        border: '1px solid #CBD5E1',
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: '0.2s ease',
        backgroundColor: '#FFFFFF'
    },

    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '18px'
    },

    tableContainer: {
        overflowX: 'auto',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        overflow: 'hidden'
    },

    tableStyle: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px'
    },

    tableHeaderRow: {
        background: '#EFF6FF'
    },

    tableHeaderCell: {
        padding: '14px',
        color: '#12306B',
        fontWeight: '800',
        textTransform: 'uppercase',
        fontSize: '12px',
        borderBottom: '2px solid #DBEAFE'
    },

    tableRow: {
        borderBottom: '1px solid #E2E8F0'
    },

    tableCell: {
        padding: '14px'
    },

    btnPrimario: {
        padding: '12px 22px',
        background: 'linear-gradient(135deg, #12306B, #1E4FAF)',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '800',
        boxShadow: '0 8px 18px rgba(30,79,175,0.35)'
    },

    btnSecundario: {
        padding: '12px 22px',
        background: '#FFFFFF',
        color: '#475569',
        border: '1px solid #CBD5E1',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '700'
    }
};

const GlobalStyles = () => (
    <style>{`
        .my-swal-container {
            z-index: 100000 !important;
        }
    `}</style>
);

export default ModalNuevoNombramiento;