import React from 'react';
import {
  Routes,
  Route
} from 'react-router-dom';

import Login from "./pages/login.jsx";
import PrincipalNombrador from "./pages/Nombrador/Principal.jsx";
import Trabajador from "./pages/trabajador.jsx";

function App() {

  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/Nombrador/Principal"
        element={<PrincipalNombrador />}
      />

      <Route
        path="/Trabajador/Dashboard"
        element={<Trabajador />}
      />

    </Routes>
  );
}

export default App;