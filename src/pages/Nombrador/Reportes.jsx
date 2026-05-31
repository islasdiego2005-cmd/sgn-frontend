import React, { useState, useEffect } from 'react';
import ModalVerDetalleN from '../../components/ModalVerDetalleN';
import { FileSpreadsheet, Eraser, Eye, Users, UserCog, CalendarDays } from 'lucide-react';
import './Reportes.css';
import { exportarExcel } from '../../utils/exportarExcel';
import { obtenerNombramientos } from '../../services/reportesService';
import { filtrarNombramientos } from '../../utils/filtrarNombramientos';
import { mapearNombramiento } from '../../utils/mapearNombramiento';
import FechaHoraActual from '../../components/FechaHoraActual/FechaHoraActual';
const Reportes = () => {

    const [esMovil, setEsMovil] = useState(window.innerWidth < 1024);

    const [busqueda, setBusqueda] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [turnoFiltro, setTurnoFiltro] = useState('Todos los turnos');

    const [nombramientos, setNombramientos] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNombramiento, setSelectedNombramiento] = useState(null);

    const limpiarFiltros = () => {
        setBusqueda('');
        setFechaFiltro('');
        setTurnoFiltro('Todos los turnos');
    };

    const fetchNombramientos = async () => {
        try {

            const data = await obtenerNombramientos();
            const datosMapeados =
                data.map(mapearNombramiento);

            setNombramientos(datosMapeados);

        } catch (err) {

            console.error(
                'Error al cargar reportes:',
                err
            );
        }
    };

    const datosFiltrados = filtrarNombramientos(
        nombramientos,
        busqueda,
        fechaFiltro,
        turnoFiltro
    );

    useEffect(() => {
        fetchNombramientos();
    }, []);

    useEffect(() => {

        const handleResize = () =>
            setEsMovil(window.innerWidth < 1024);

        window.addEventListener(
            'resize',
            handleResize
        );

        return () =>
            window.removeEventListener(
                'resize',
                handleResize
            );

    }, []);


    return (
        <>
            <div className="reportes-header">

                <h1 className="reportes-titulo">
                    Reportes
                </h1>

                <FechaHoraActual />

            </div>

            {/* --- BLOQUE DE FILTROS --- */}
            <div className="reportes-filtros">
                <input
                    type="text"
                    placeholder="Buscar buque o folio..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="input-filtro input-busqueda"
                />

                <input
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    className="input-filtro input-fecha"
                />

                <select
                    value={turnoFiltro}
                    onChange={(e) => setTurnoFiltro(e.target.value)}
                    className="input-filtro select-turno"
                >
                    <option>Todos los turnos</option>
                    <option>Primer Turno</option>
                    <option>Segundo Turno</option>
                    <option>Tercer Turno</option>
                </select>

                {/* Contenedor unificado para que se alineen bien */}
                <div className="botones-filtros" style={{ flexShrink: 0 }}>

                    <button className="btn-buscar" onClick={limpiarFiltros}>
                        <Eraser size={18} style={{ marginRight: '5px' }} /> Limpiar
                    </button>
                </div>
            </div>

            {/* --- INDICADOR DE RESULTADOS --- */}
            <div style={{ marginBottom: '15px', color: '#64748b', fontSize: '0.9rem', paddingLeft: '5px' }}>
                <div className="contador-resultados">
                    Mostrando {datosFiltrados.length} resultados encontrados
                </div>            </div>

            <div className="tabla-container">

                <div className="tabla-reportes">

                    <div className="tabla-header">

                        <div className="col-operativos">
                            Datos Operativos
                        </div>

                        <div className="col-buque">
                            Buque / Área
                        </div>

                        <div className="col-personal">
                            Resumen Personal
                        </div>

                        <div className="col-acciones">
                            Acciones
                        </div>

                    </div>

                    {datosFiltrados.map(item => (

                        <div
                            key={item.id}
                            className="tabla-row"
                        >

                            <div className="col-operativos">

                                <div className="fecha-row">
                                    <CalendarDays size={15} />
                                    <span>{item.fecha}</span>
                                </div>

                                <div className="folio-row">
                                    Folio:
                                    <b> #{item.folio}</b>
                                </div>

                            </div>

                            <div className="col-buque">

                                <div className="turno-row">
                                    {item.titulo}
                                </div>

                                <div className="buque-row">
                                    {item.buque}
                                </div>

                            </div>

                            <div className="resumen-card">

                                <div className="resumen-item">

                                    <div className="resumen-label">
                                        <Users
                                            size={18}
                                            className="icono-sindicalizado"
                                        />

                                        <span>
                                            Sindicalizados:
                                        </span>
                                    </div>

                                    <span className="resumen-numero">
                                        {item.sindicalizados}
                                    </span>

                                </div>

                                <div className="resumen-item">

                                    <div className="resumen-label">
                                        <UserCog
                                            size={18}
                                            className="icono-apoyo"
                                        />

                                        <span>
                                            Personal de apoyo:
                                        </span>
                                    </div>

                                    <span
                                        className="resumen-numero apoyo"
                                    >
                                        {item.personalApoyo || 0}
                                    </span>

                                </div>

                                <div className="resumen-divider"></div>

                                <div className="resumen-total">
                                    <span>Total:</span>

                                    <span>
                                        {(item.sindicalizados || 0) +
                                            (item.personalApoyo || 0)}
                                    </span>
                                </div>

                            </div>
                            <div className="col-acciones">

                                <button
                                    onClick={() => exportarExcel([item])}
                                    className="btn-excel"
                                >
                                    <FileSpreadsheet size={20} />
                                    Descargar
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedNombramiento(item.raw);
                                        setModalOpen(true);
                                    }}
                                    className="btn-detalle"
                                >
                                    <Eye size={20} />
                                    Ver Detalle
                                </button>
                            </div>

                        </div>

                    ))}

                </div>

            </div>

            <ModalVerDetalleN
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedNombramiento(null);
                }}
                nombramiento={selectedNombramiento}
            />
        </>
    );
};

export default Reportes;