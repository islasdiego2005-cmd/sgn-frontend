import React, { useState, useEffect } from 'react';
import './Layout.css';

import logo1 from '../assets/imagenes/logo1.png';

import iconoHogar from '../assets/imagenes/hogar.png';
import iconoReporte from '../assets/imagenes/reporte.png';
import iconoTrabajador from '../assets/imagenes/trabajador.png';
import iconoConfig from '../assets/imagenes/configuraciones.png';

import fotoPerfil from '../assets/imagenes/fotoperfilm.png';

import iconoCerrar from '../assets/imagenes/iconocerrar.png';
import iconoMenu from '../assets/imagenes/menu.png';

const Layout = ({
    children,
    seccionActiva,
    onChangeSeccion,
    usuario,
    onLogout
}) => {

    const [menuAbierto, setMenuAbierto] = useState(false);

    const [esMovil, setEsMovil] = useState(
        window.innerWidth < 1024
    );

    useEffect(() => {

        const handleResize = () => {

            const movil = window.innerWidth < 1024;

            setEsMovil(movil);

            if (!movil) {
                setMenuAbierto(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () =>
            window.removeEventListener('resize', handleResize);

    }, []);

    const toggleMenu = () => {
        setMenuAbierto(!menuAbierto);
    };

    const handleCerrarSesion = () => {

        if (onLogout) {
            onLogout();
        } else {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    const opcionesMenu = [
        {
            nombre: 'Principal',
            icono: iconoHogar
        },
        {
            nombre: 'Reportes',
            icono: iconoReporte
        },
        {
            nombre: 'Trabajadores',
            icono: iconoTrabajador
        },
        {
            nombre: 'Configuración',
            icono: iconoConfig
        }
    ];

    return (
        <div className="layout-container">

            {esMovil && menuAbierto && (
                <div
                    className="overlay"
                    onClick={toggleMenu}
                />

            )}

            <aside
                className={`sidebar ${menuAbierto ? 'abierto' : ''
                    }`}
            >

                <div className="perfil-container">

                    <div className="foto-perfil">
                        <img
                            src={fotoPerfil}
                            alt="Perfil"
                        />
                    </div>

                    <div className="nombre-usuario">
                        {usuario?.nombre_completo ||
                            'Invitado'}
                    </div>

                    <div className="matricula-text">
                        Matrícula:{' '}
                        {usuario?.num_control || 'N/A'}
                    </div>

                    <div className="rol">
                        {usuario?.rol || 'Nombrador'}
                    </div>

                </div>

                <nav className="nav-menu">

                    {opcionesMenu.map((opcion, index) => (

                        <button
                            key={index}
                            className={
                                seccionActiva === opcion.nombre
                                    ? 'active'
                                    : ''
                            }
                            onClick={() => {

                                onChangeSeccion(
                                    opcion.nombre
                                );

                                if (esMovil) {
                                    setMenuAbierto(false);
                                }
                            }}
                        >

                            <img
                                src={opcion.icono}
                                alt={opcion.nombre}
                            />

                            <span>
                                {opcion.nombre}
                            </span>

                        </button>

                    ))}

                </nav>

                <button
                    className="btn-cerrar"
                    onClick={handleCerrarSesion}
                >

                    <img
                        src={iconoCerrar}
                        alt="Cerrar sesión"
                    />

                    <span>
                        Cerrar Sesión
                    </span>

                </button>

            </aside>

            <div className="contenido-derecha">
                <header className="header-principal">

                    <div className="header-left">

                        {esMovil && (
                            <button
                                className="btn-menu"
                                onClick={toggleMenu}
                            >
                                <img
                                    src={iconoMenu}
                                    alt="Menú"
                                />
                            </button>
                        )}

                        <h2>
                            Sistema Gestor de
                            Nombramientos
                        </h2>

                    </div>

                    <img
                        src={logo1}
                        alt="CPV"
                        className="logo-empresa"
                    />

                </header>

                <main className="main-content">
                    {children}
                </main>

            </div>

        </div>
    );
};

export default Layout;