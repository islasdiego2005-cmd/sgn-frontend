import React, { useState, useEffect } from 'react';

const Layout = ({ children, seccionActiva, onChangeSeccion, usuario, onLogout }) => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [esMovil, setEsMovil] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setEsMovil(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => setMenuAbierto(!menuAbierto);

    // FUNCIÓN PARA CERRAR SESIÓN Y LIMPIAR EL ALMACENAMIENTO
    const handleCerrarSesion = () => {
        if (onLogout) {
            onLogout();
            return;
        }

        localStorage.removeItem('usuario_sgn');
        localStorage.removeItem('usuario');
        localStorage.removeItem('rol');
        window.location.href = '/';
    };

    const nombreUsuario = usuario?.nombre_completo || usuario?.nombre || 'Invitado';
    const matriculaUsuario = usuario?.num_control ? `Matrícula: ${usuario.num_control}` : '';

    const opcionesMenu = [
        { nombre: 'Principal', icono: '/src/assets/imagenes/hogar.png' },
        { nombre: 'Reportes', icono: '/src/assets/imagenes/reporte.png' },
        { nombre: 'Trabajadores', icono: '/src/assets/imagenes/trabajador.png' },
        { nombre: 'Configuración', icono: '/src/assets/imagenes/configuraciones.png' }
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#C4C4C5', fontFamily: 'sans-serif', overflow: 'hidden' }}>


            {esMovil && menuAbierto && (
                <div onClick={toggleMenu} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
            )}

            {/* PANEL LATERAL */}
            <aside style={{
                width: '280px', backgroundColor: '#122C5F', display: 'flex', flexDirection: 'column',
                position: esMovil ? 'fixed' : 'relative', left: esMovil ? (menuAbierto ? '0' : '-280px') : '0',
                transition: 'left 0.3s ease', height: '100vh', zIndex: 999, boxShadow: '4px 0 10px rgba(0,0,0,0.2)'
            }}>
                {/* Sección de Perfil */}
                <div style={{ backgroundColor: '#4472C4', padding: '20px 15px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'white', overflow: 'hidden', border: '3px solid #fff' }}>
                        <img src="/src/assets/imagenes/fotoperfilm.png" alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', lineHeight: '1.2' }}>
                        {nombreUsuario}
                    </div>
                    {matriculaUsuario && (
                        <div style={{ color: '#dbeafe', marginTop: '5px', fontSize: '0.9rem' }}>
                            {matriculaUsuario}
                        </div>
                    )}
                </div>

                {/* LISTA DE BOTONES DEL MENÚ */}
                <nav style={{ flex: 1 }}>
                    {opcionesMenu.map((opcion, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (onChangeSeccion) onChangeSeccion(opcion.nombre);
                                if (esMovil) setMenuAbierto(false);
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '15px', color: 'white', fontSize: '1rem', cursor: 'pointer', padding: '15px 20px', width: '100%',
                                backgroundColor: seccionActiva === opcion.nombre ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', outline: 'none',
                                transition: 'background-color 0.3s ease', height: '65px'
                            }}
                        >
                            <img src={opcion.icono} alt={opcion.nombre} style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                            <span style={{ fontWeight: seccionActiva === opcion.nombre ? 'bold' : 'normal' }}>{opcion.nombre}</span>
                        </button>
                    ))}
                </nav>

                {/* BOTÓN CERRAR SESIÓN (Funcionalidad Inyectada) */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto', padding: '0', width: '100%' }}>
                    <button
                        onClick={handleCerrarSesion}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '15px', color: 'white', fontSize: '1rem', cursor: 'pointer', padding: '15px 20px', width: '100%',
                            backgroundColor: 'transparent', border: 'none', textAlign: 'left', outline: 'none', transition: 'background-color 0.3s ease', height: '64px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{
                            backgroundColor: '#4472C4', borderRadius: '6px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '45px', height: '45px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', flexShrink: 0
                        }}>
                            <img src="/src/assets/imagenes/iconocerrar.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontWeight: '500', userSelect: 'none' }}>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* CONTENIDO DERECHA */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                overflowX: 'hidden'
            }}>
                <header style={{
                    backgroundColor: '#888888',
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                    height: '60px'
                }}>
                    {/* Izquierda: Menú y Título */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {esMovil && (
                            <button onClick={toggleMenu} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <img src="/src/assets/imagenes/menu.png" alt="Menú" style={{ width: '40px', height: '40px' }} />
                            </button>
                        )}
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {esMovil ? 'SGN' : 'Sistema Gestor de Nombramientos'}
                        </h2>
                    </div>


                    <img
                        src="/src/assets/imagenes/logo1.png"
                        alt="CPV"
                        style={{ height: '40px', objectFit: 'contain' }}
                    />
                </header>


                <main style={{
                    flex: 1,
                    padding: esMovil ? '15px' : '30px',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;