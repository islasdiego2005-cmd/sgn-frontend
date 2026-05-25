// ESTE BLOQUE SOLO DEBE APARECER UNA VEZ EN TODO EL ARCHIVO
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import PanelPrincipal from './panelprincipal'; 
import Trabajadores from './Trabajadores';
import Configuracion from './Configuracion';
import Reportes from './Reportes';

const Principal = () => {
    const [seccionActiva, setSeccionActiva] = useState('Principal');
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        // Leer usuario desde localStorage
        const usuarioGuardado = localStorage.getItem('usuario_sgn');
        if (usuarioGuardado) {
            try {
                setUsuario(JSON.parse(usuarioGuardado));
            } catch (err) {
                console.error('Error al parsear usuario:', err);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('usuario_sgn');
        localStorage.removeItem('usuario');
        localStorage.removeItem('rol');
        window.location.href = '/';
    };

    const renderizarContenido = () => {
        switch (seccionActiva) {
            case 'Principal': return <PanelPrincipal />;
            case 'Trabajadores': return <Trabajadores />;
            case 'Configuración': return <Configuracion />;
            case 'Reportes': return <Reportes />;
            default: return <PanelPrincipal />;
        }
    };

    return (
        <Layout seccionActiva={seccionActiva} onChangeSeccion={setSeccionActiva} usuario={usuario} onLogout={handleLogout}>
            {renderizarContenido()}
        </Layout>
    );
};

export default Principal;