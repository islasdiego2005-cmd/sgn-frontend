import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
const Trabajador = () => {
    const [seleccionadas, setSeleccionadas] = useState([]);
    const [datosTrabajador, setDatosTrabajador] = useState(null);
    const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([]);
    const [esMovil, setEsMovil] = useState(window.innerWidth < 1024);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [cursosTrabajador, setCursosTrabajador] = useState([]);
    const [yaPostulado, setYaPostulado] = useState(false);
    const [cargandoDisponibles, setCargandoDisponibles] = useState(true);


    useEffect(() => {

        const verificarResultado = async () => {

            try {

                const usuario =
                    JSON.parse(
                        localStorage.getItem(
                            'usuario_sgn'
                        )
                    );

                const res = await axios.get(
                    `http://localhost:5000/api/trabajadores/${usuario.num_control}/resultado`);

                if (res.data.resultado) {
                    Swal.fire({
                        title: '¡Selección Confirmada!',
                        text: `Fuiste seleccionado para el puesto: ${res.data.resultado}`,
                        icon: 'success',
                        confirmButtonColor: '#122C5F',
                        confirmButtonText: 'Entendido'
                    });
                }

            } catch (err) {

                console.error(err);

            }

        };

        verificarResultado();

    }, []);

    useEffect(() => {

        const handleResize = () => setEsMovil(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);

        const sesion = localStorage.getItem('usuario_sgn');
        const usuarioObj = sesion ? JSON.parse(sesion) : null;

        if (usuarioObj) {
            setDatosTrabajador(usuarioObj);
        }

        const cargarDatos = async () => {

            try {


                const resEspecialidades = await axios.get(
                    'http://localhost:5000/api/convocatorias/disponibles'
                );

                setEspecialidadesDisponibles(resEspecialidades.data);


                if (usuarioObj) {

                    const resCursos = await axios.get(
                        `http://localhost:5000/api/trabajadores/${usuarioObj.num_control}/cursos`
                    );

                    console.log("CURSOS DEL TRABAJADOR:", resCursos.data);



                    const cursosNormalizados = resCursos.data.map(curso => {

                        // Si viene como string
                        if (typeof curso === 'string') {
                            return curso.toUpperCase().trim();
                        }

                        // Si viene como objeto
                        return (
                            curso.nombre ||
                            curso.nombre_curso ||
                            curso.especialidad ||
                            ''
                        ).toUpperCase().trim();

                    });

                    setCursosTrabajador(cursosNormalizados);


                    const resPostulacion = await axios.get(
                        `http://localhost:5000/api/trabajadores/${usuarioObj.num_control}/postulacion-activa`
                    );

                    setYaPostulado(resPostulacion.data.yaPostulado);
                }

            } catch (error) {

                console.error("Error cargando datos:", error);

            } finally {

                setCargandoDisponibles(false);

            }
        };

        cargarDatos();

        return () => window.removeEventListener('resize', handleResize);

    }, []);

    const toggleMenu = () => setMenuAbierto(!menuAbierto);

    const handleLogout = () => {
        localStorage.removeItem('usuario_sgn');
        window.location.href = '/';
    };

    const handleConfirmarPostulacion = async () => {
        // ALERTA DE VALIDACIÓN
        if (seleccionadas.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Selecciona al menos una categoría.',
                confirmButtonColor: '#122C5F'
            });
            return;
        }

        if (!datosTrabajador) {
            Swal.fire({
                icon: 'error',
                title: 'Sesión no detectada',
                text: 'Por favor, inicia sesión nuevamente.',
                confirmButtonColor: '#DC2626'
            });
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/postulaciones/crear', {
                num_control: datosTrabajador.num_control,
                puestos: seleccionadas
            });

            // ALERTA DE ÉXITO
            await Swal.fire({
                icon: 'success',
                title: '¡Postulación enviada!',
                text: "Tu registro se ha completado con éxito.",
                confirmButtonColor: '#1a8a34'
            });

            setSeleccionadas([]);
            setYaPostulado(true);

        } catch (error) {
            console.error(error);
            const mensaje = error.response?.data?.error || error.message;
            const detalles = error.response?.data?.detalles || [];

            // ALERTA DE ERROR DETALLADO
            Swal.fire({
                icon: 'error',
                title: 'Error en postulación',
                html: `<strong>${mensaje}</strong><br/>${detalles.join('<br/>')}`,
                confirmButtonColor: '#DC2626'
            });
        }
    };

    const categorias = [
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

    return (

        <div
            style={{
                display: 'flex',
                height: '100vh',
                width: '100%',
                backgroundColor: '#C4C4C5',
                fontFamily: 'sans-serif',
                overflow: 'hidden'
            }}
        >

            {/* Overlay móvil */}
            {esMovil && menuAbierto && (
                <div
                    onClick={toggleMenu}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 998
                    }}
                />
            )}

            {/* SIDEBAR */}
            <aside
                style={{
                    width: '280px',
                    backgroundColor: '#122C5F',
                    display: 'flex',
                    flexDirection: 'column',
                    position: esMovil ? 'fixed' : 'relative',
                    left: esMovil ? (menuAbierto ? '0' : '-280px') : '0',
                    transition: 'left 0.3s ease',
                    height: '100vh',
                    zIndex: 999
                }}
            >

                <div
                    style={{
                        backgroundColor: '#4472C4',
                        padding: '40px 20px',
                        textAlign: 'center'
                    }}
                >

                    <div
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            margin: '0 auto',
                            border: '4px solid white'
                        }}
                    >
                        <img
                            src="/src/assets/imagenes/fotoperfilm.png"
                            alt="Perfil"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    <div
                        style={{
                            color: 'white',
                            fontWeight: 'bold',
                            marginTop: '15px',
                            fontSize: '1.1rem'
                        }}
                    >
                        {datosTrabajador
                            ? datosTrabajador.nombre_completo
                            : "Cargando..."}
                    </div>

                    <div
                        style={{
                            color: '#dbeafe',
                            marginTop: '5px'
                        }}
                    >
                        {datosTrabajador
                            ? `Matrícula: ${datosTrabajador.num_control}`
                            : ""}
                    </div>

                </div>

                <div style={{ flex: 1 }} />

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        color: 'white',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        padding: '15px 20px',
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        outline: 'none',
                        transition: 'background-color 0.3s ease',
                        height: '64px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div style={{
                        backgroundColor: '#4472C4',
                        borderRadius: '6px',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '45px',
                        height: '45px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        flexShrink: 0
                    }}>
                        <img src="/src/assets/imagenes/iconocerrar.png" alt="Cerrar sesión" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontWeight: '500', userSelect: 'none' }}>Cerrar Sesión</span>
                </button>

            </aside>

            {/* CONTENIDO */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >

                {/* HEADER */}
                <header
                    style={{
                        backgroundColor: '#888',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'white'
                    }}
                >

                    <h2>
                        {esMovil
                            ? 'SGN'
                            : 'Sistema Gestor de Nombramientos'}
                    </h2>

                    <img
                        src="/src/assets/imagenes/logo1.png"
                        alt="Logo"
                        style={{ height: '40px' }}
                    />

                </header>

                {/* MAIN */}
                <main
                    style={{
                        padding: '30px',
                        overflowY: 'auto'
                    }}
                >

                    <h1
                        style={{
                            textAlign: 'center',
                            color: '#0A1F44',
                            fontSize: '2.5rem',
                            fontWeight: '900'
                        }}
                    >
                        Postulación de Maniobra
                    </h1>

                    <p
                        style={{
                            textAlign: 'center',
                            color: '#2563eb',
                            fontWeight: 'bold'
                        }}
                    >
                        Toca las categorías en azul para postularte
                    </p>

                    <h3
                        style={{
                            color: '#666',
                            marginTop: '30px'
                        }}
                    >
                        Categorías Disponibles
                        {cargandoDisponibles && " (Cargando...)"}
                    </h3>

                    {/* GRID */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: esMovil
                                ? 'repeat(2,1fr)'
                                : 'repeat(auto-fill,minmax(200px,1fr))',
                            gap: '15px'
                        }}
                    >

                        {categorias.map((cat) => {

                            const categoriaNormalizada =
                                cat.toUpperCase().trim();

                            const estaSeleccionada =
                                seleccionadas.includes(cat);

                            const estaEnConvocatoria =
                                especialidadesDisponibles
                                    .map(e => e.toUpperCase().trim())
                                    .includes(categoriaNormalizada);


                            const tieneCurso =
                                cursosTrabajador.includes(
                                    categoriaNormalizada
                                );

                            const esDisponible =
                                estaEnConvocatoria && tieneCurso;

                            let bgColor;
                            let textColor;
                            let borderColor;
                            let cursorStyle;

                            if (yaPostulado) {

                                bgColor = '#e5e7eb';
                                textColor = '#9ca3af';
                                borderColor = '#d1d5db';
                                cursorStyle = 'not-allowed';

                            } else if (!esDisponible) {


                                bgColor = '#d1d5db';
                                textColor = '#6b7280';
                                borderColor = '#d1d5db';
                                cursorStyle = 'not-allowed';

                            } else if (estaSeleccionada) {


                                bgColor = 'white';
                                textColor = '#2563eb';
                                borderColor = '#2563eb';
                                cursorStyle = 'pointer';

                            } else {


                                bgColor = '#2563eb';
                                textColor = 'white';
                                borderColor = '#2563eb';
                                cursorStyle = 'pointer';

                            }

                            return (

                                <button
                                    key={cat}
                                    disabled={!esDisponible || yaPostulado}
                                    onClick={() => {

                                        if (!esDisponible || yaPostulado)
                                            return;

                                        if (estaSeleccionada) {

                                            setSeleccionadas(
                                                seleccionadas.filter(
                                                    item => item !== cat
                                                )
                                            );

                                        } else {

                                            setSeleccionadas([
                                                ...seleccionadas,
                                                cat
                                            ]);

                                        }
                                    }}
                                    style={{
                                        height: '90px',
                                        borderRadius: '10px',
                                        border: `2px solid ${borderColor}`,
                                        fontWeight: '800',
                                        cursor: cursorStyle,
                                        backgroundColor: bgColor,
                                        color: textColor,
                                        transition: 'all 0.2s ease',
                                        opacity:
                                            (esDisponible && !yaPostulado)
                                                ? 1
                                                : 0.6
                                    }}
                                >
                                    {cat}
                                </button>

                            );
                        })}
                    </div>

                    {/* BOTÓN */}
                    <button
                        onClick={handleConfirmarPostulacion}
                        disabled={
                            seleccionadas.length === 0 ||
                            yaPostulado
                        }
                        style={{
                            backgroundColor:
                                yaPostulado
                                    ? '#059669'
                                    : seleccionadas.length > 0
                                        ? '#16a34a'
                                        : '#9ca3af',

                            color: 'white',
                            padding: '15px',
                            width: '100%',
                            borderRadius: '10px',
                            border: 'none',
                            marginTop: '25px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor:
                                (seleccionadas.length > 0 && !yaPostulado)
                                    ? 'pointer'
                                    : 'not-allowed'
                        }}
                    >
                        {yaPostulado
                            ? 'POSTULACIÓN ENVIADA'
                            : 'CONFIRMAR POSTULACIÓN'}
                    </button>

                </main>

            </div>
        </div>
    );
};

export default Trabajador;