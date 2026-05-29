import React from 'react';
import Login from "./pages/login.jsx";
import PrincipalNombrador from "./pages/Nombrador/Principal.jsx";
import Trabajador from "./pages/trabajador.jsx";

function App() {

  // LEER EL HASH EN VEZ DEL PATHNAME
  const rutaActual = window.location.hash;

  if (rutaActual === '#/Nombrador/Principal') {
    return <PrincipalNombrador />;
  }

  if (rutaActual === '#/Trabajador/Dashboard') {
    return <Trabajador />;
  }

  // Ruta por defecto
  return <Login />;
}

export default App;