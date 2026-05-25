import React from 'react';
import Login from "./pages/login.jsx";
import PrincipalNombrador from "./pages/Nombrador/Principal.jsx";
import Trabajador from "./pages/trabajador.jsx"; // <-- Asegúrate de que esta ruta apunte a tu archivo de Trabajador

function App() {
  // Leemos la ruta actual en la barra de direcciones
  const rutaActual = window.location.pathname;

  // 🔀 Enrutador Condicional Rápido
  if (rutaActual === '/Nombrador/Principal') {
    return <PrincipalNombrador />;
  }

  if (rutaActual === '/trabajador/Dashboard') {
    return <Trabajador />;
  }

  // Si no está en ninguna de las rutas de arriba (como la raíz "/"), muestra el Login
  return <Login />;
}

export default App;
