import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx-js-style';
import ModalVerDetalleN from '../../components/ModalVerDetalleN';

const Reportes = () => {
    const [esMovil, setEsMovil] = useState(window.innerWidth < 1024);
    const [fechaActual, setFechaActual] = useState(new Date());

    const [busqueda, setBusqueda] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [turnoFiltro, setTurnoFiltro] = useState('Todos los turnos');

    const [nombramientos, setNombramientos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNombramiento, setSelectedNombramiento] = useState(null);

    // Función para obtener nombramientos desde la API y mapearlos para la UI
    const fetchNombramientos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/nombramientos');
            const datosMapeados = response.data.map(item => {
                const fechaRaw = item.fecha_carga || item.fecha || item.fechaCarga || item.created_at || item.createdAt || null;
                let fecha = 'S/F';
                if (fechaRaw) {
                    if (typeof fechaRaw === 'string') {
                        fecha = fechaRaw.includes('T') ? fechaRaw.split('T')[0] : (fechaRaw.includes(' ') ? fechaRaw.split(' ')[0] : fechaRaw);
                    } else if (fechaRaw instanceof Date) {
                        fecha = fechaRaw.toISOString().split('T')[0];
                    } else {
                        fecha = String(fechaRaw).split('T')[0];
                    }
                }

                return {
                    id: item.id_nombramiento,
                    fecha,
                    folio: item.codigo_nombramiento,
                    // clave eliminado: es repetitiva con folio
                    titulo: item.turno,
                    buque: item.barco || item.nombre_buque || item.buque,

                    sindicalizados: (item.vacantes || []).reduce((acc, v) => acc + (v.cantidad || 0), 0),
                    vacantes: item.vacantes || [],
                    raw: item // guardamos el objeto original para pasarlo al modal
                };
            });

            setNombramientos(datosMapeados);
        } catch (err) {
            console.error("Error al cargar reportes:", err);
        }
    };

    useEffect(() => {
        fetchNombramientos();
    }, []);

    useEffect(() => {
        const handleResize = () => setEsMovil(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setFechaActual(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatearFecha = () => fechaActual.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formatearHora = () => fechaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });


    const normalize = (s = '') => String(s).toLowerCase();

    const datosFiltrados = nombramientos.filter(item => {
        const coincideTexto = normalize(item.buque).includes(normalize(busqueda)) || normalize(item.folio).includes(normalize(busqueda));
        const coincideFecha = !fechaFiltro || (() => {
            if (!fechaFiltro) return true;
            if (!item.fecha || item.fecha === 'S/F') return false;
            try {
                const a = new Date(item.fecha);
                const b = new Date(fechaFiltro);
                return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
            } catch (e) {
                return item.fecha === fechaFiltro;
            }
        })();

        let coincideTurno = true;
        if (turnoFiltro && turnoFiltro !== 'Todos los turnos') {
            const tf = normalize(turnoFiltro);
            const titulo = normalize(item.titulo);
            // Coincidir por texto o por número de turno (primer->1, segundo->2, tercer->3)
            coincideTurno = titulo.includes(tf) || (tf.includes('primer') && titulo.includes('1')) || (tf.includes('segundo') && titulo.includes('2')) || (tf.includes('tercer') && titulo.includes('3'));
        }

        return coincideTexto && coincideFecha && coincideTurno;
    });

    const exportarExcel = async (lista) => {
        if (lista.length === 0) return;

        const wb = XLSX.utils.book_new();

        for (const item of lista) {
            const folioSafe = String(item.folio).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 20);

            // Detalle sheet: lista de pares campo/valor
            const vacantesStr = (item.vacantes || []).map(v => `${v.puesto || v.nombre_puesto || v.puesto_requerido || v.nombre}: ${v.cantidad || 0}`).join(' | ');

            const detalleRows = [
                { Campo: 'ID', Valor: item.id },
                { Campo: 'Folio', Valor: item.folio },
                { Campo: 'Codigo', Valor: item.raw?.codigo_nombramiento || item.folio },
                { Campo: 'Buque', Valor: item.buque },
                { Campo: 'Turno', Valor: item.titulo },
                { Campo: 'FechaCarga', Valor: item.raw?.fecha_carga || item.fecha },
                { Campo: 'FechaCierre', Valor: item.raw?.fecha_cierre || '' },
                { Campo: 'Sindicalizados', Valor: item.sindicalizados },
                { Campo: 'Vacantes', Valor: vacantesStr }
            ];

            // Agregar campos primitivos adicionales del objeto raw
            if (item.raw && typeof item.raw === 'object') {
                Object.keys(item.raw).forEach(k => {
                    const val = item.raw[k];
                    if (val === null) return;
                    if (['string', 'number', 'boolean'].includes(typeof val)) {
                        detalleRows.push({ Campo: k, Valor: val });
                    }
                });
            }

            const wsDetalle = XLSX.utils.json_to_sheet(detalleRows, { header: ['Campo', 'Valor'] });

            // Estilo encabezado
            const headerStyle = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '122C5F' } }, alignment: { horizontal: 'center' } };
            const rangoDet = XLSX.utils.decode_range(wsDetalle['!ref']);
            for (let C = rangoDet.s.c; C <= rangoDet.e.c; ++C) {
                const direccion = XLSX.utils.encode_cell({ c: C, r: 0 });
                if (wsDetalle[direccion]) wsDetalle[direccion].s = headerStyle;
            }
            wsDetalle['!cols'] = [{ wch: 25 }, { wch: 60 }];
            XLSX.utils.book_append_sheet(wb, wsDetalle, `Detalle_${folioSafe}`);

            // Postulados sheet: obtener postulados desde API para este nombramiento
            try {
                const id = item.id || item.raw?.id_nombramiento;
                const resp = await axios.get(`http://localhost:5000/api/nombramientos/${id}/postulados`); 
                const postulados = resp.data || [];

                const postuladosRows = postulados.map(p => ({
                    Matricula: p.num_control || p.matricula || '',
                    Trabajador: p.nombre_completo || p.nombre || p.nombre_trabajador || p.trabajador || '',
                    Puesto: Array.isArray(p.puesto_requerido) ? p.puesto_requerido.join(', ') : (p.puesto_requerido || p.puesto || p.puesto_solicitado || ''),
                    Hora: p.fecha_postulacion ? new Date(p.fecha_postulacion).toLocaleString('es-MX') : (p.hora || ''),
                    Estado: p.resultado || p.estado || ''
                }));

                const wsPost = XLSX.utils.json_to_sheet(postuladosRows);
                const rangoPos = XLSX.utils.decode_range(wsPost['!ref'] || 'A1');
                for (let C = rangoPos.s.c; C <= rangoPos.e.c; ++C) {
                    const direccion = XLSX.utils.encode_cell({ c: C, r: 0 });
                    if (wsPost[direccion]) wsPost[direccion].s = headerStyle;
                }
                wsPost['!cols'] = [{ wch: 14 }, { wch: 32 }, { wch: 28 }, { wch: 22 }, { wch: 14 }];
                XLSX.utils.book_append_sheet(wb, wsPost, `Postulados_${folioSafe}`);
            } catch (err) {
                // Si falla la petición de postulados, añadimos una hoja vacía con nota
                const wsError = XLSX.utils.json_to_sheet([{ Info: 'No se pudieron obtener postulados' }]);
                XLSX.utils.book_append_sheet(wb, wsError, `Postulados_${folioSafe}`);
            }
        }

        XLSX.writeFile(wb, "Reporte_Nombramientos_Completo.xlsx");
    };

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                marginBottom: '20px',
                paddingLeft: '25px',
                paddingRight: '25px',
                boxSizing: 'border-box'
            }}>
                {/* Título */}
                <h1 style={{
                    fontSize: esMovil ? '1.5rem' : '2rem',
                    color: '#122C5F',
                    margin: 0,
                    fontWeight: 'bold'
                }}>
                    Reportes
                </h1>


                <div style={{
                    textAlign: 'right',
                    color: '#717171',
                    fontSize: esMovil ? '0.8rem' : '1rem',
                    fontWeight: '600'
                }}>
                    <div style={{ textTransform: 'capitalize', lineHeight: '1.2' }}>
                        {formatearFecha()}
                    </div>
                    <span style={{
                        fontSize: esMovil ? '1rem' : '1.2rem',
                        color: '#122C5F',
                        display: 'block',
                        fontWeight: 'bold',
                        marginTop: '2px'
                    }}>
                        {formatearHora()}
                    </span>
                </div>
            </div>


            <div style={{
                backgroundColor: 'white',
                padding: '15px 25px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '15px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                marginBottom: '30px',
                border: '1px solid #f3f4f6'
            }}>

                <input
                    type="text"
                    placeholder="Buscar buque o folio..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                        ...estiloUnificado,
                        flex: 1,
                        minWidth: '250px'
                    }}
                />

                <input
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    style={{ ...estiloUnificado, width: '160px' }}
                />

                <select
                    value={turnoFiltro}
                    onChange={(e) => setTurnoFiltro(e.target.value)}
                    style={{ ...estiloUnificado, width: '180px', cursor: 'pointer' }}
                >
                    <option>Todos los turnos</option>
                    <option>Primer Turno</option>
                    <option>Segundo Turno</option>
                    <option>Tercer Turno</option>
                </select>

                <button style={{
                    ...estiloUnificado,
                    backgroundColor: '#4472C4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    width: '120px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    justifyContent: 'center'
                }}>
                    Buscar
                </button>
            </div>

            {/* CONTENEDOR DE LA TABLA CON SCROLL HORIZONTAL */}
            <div style={{ width: '100%', overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ minWidth: '900px' }}>
                    <div style={{ backgroundColor: '#4472C4', color: 'white', padding: '12px 20px', display: 'flex', fontWeight: 'bold' }}>
                        <div style={{ flex: 1 }}>Datos Operativos</div>
                        <div style={{ flex: 2.5, textAlign: 'center' }}>Buque / Area</div>
                        <div style={{ flex: 2, textAlign: 'center' }}>Resumen Personal</div>
                        <div style={{ flex: 1.5, textAlign: 'center' }}>Acciones</div>
                    </div>

                    {datosFiltrados.map(item => (
                        <div key={item.id} style={{ backgroundColor: 'white', padding: '20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#4472C4', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.fecha}</div>
                                <div style={{ color: '#333', fontSize: '0.9rem' }}>Folio: <b>#{item.folio}</b></div>
                            </div>
                            <div style={{ flex: 2.5, textAlign: 'center' }}>
                                <div style={{ color: '#999', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.titulo}</div>
                                <div style={{ color: 'black', fontSize: '1.4rem', fontWeight: 'bold' }}>{item.buque}</div>
                            </div>
                            <div style={{ flex: 2, textAlign: 'center', color: '#333' }}>
                                <div>Sindicalizados: <b>{item.sindicalizados}</b></div>
                                <div style={{ borderTop: '1px solid #eee', marginTop: '5px', paddingTop: '5px' }}>Total: <b>{item.sindicalizados}</b></div>
                            </div>
                            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <button
                                    onClick={() => exportarExcel([item])}
                                    style={estiloBotonAccion('#1a8a34')}
                                >
                                    Descargar Excel
                                </button>
                                <button
                                    onClick={() => { setSelectedNombramiento(item.raw); setModalOpen(true); }}
                                    style={estiloBotonAccion('#4472C4')}
                                >Ver Detalle</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Modal solo lectura mostrando detalle y postulados */}
            <ModalVerDetalleN
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedNombramiento(null); }}
                nombramiento={selectedNombramiento}
            />
        </>
    );
};


const estiloUnificado = {
    height: '50px',
    padding: '0 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    outline: 'none',
    fontWeight: '500',
    fontSize: '1rem',
    boxSizing: 'border-box',
    margin: 0,
    display: 'flex',
    alignItems: 'center'
};

const estiloBotonAccion = (colorFondo) => ({
    backgroundColor: colorFondo, color: 'white', border: 'none', borderRadius: '6px',
    padding: '10px 15px', fontWeight: 'bold', width: '100%', maxWidth: '160px', cursor: 'pointer', fontSize: '0.85rem'
});

export default Reportes;