import React, { useState, useEffect } from 'react';
import './FechaHoraActual.css';

function FechaHoraActual() {

    const [fechaActual, setFechaActual] =
        useState(new Date());

    useEffect(() => {

        const timer = setInterval(() => {
            setFechaActual(new Date());
        }, 1000);

        return () => clearInterval(timer);

    }, []);

    const fecha = fechaActual.toLocaleDateString(
        'es-MX',
        {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    );

    const hora = fechaActual.toLocaleTimeString(
        'es-MX',
        {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
    );

    return (
        <div className="fecha-actual">

            <div className="fecha-texto">
                {fecha}
            </div>

            <div className="hora-texto">
                {hora}
            </div>

        </div>
    );
}

export default FechaHoraActual;