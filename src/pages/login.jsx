import React, { useState } from 'react';
import axios from 'axios';
import logo1 from '../assets/imagenes/logo1.png';
import lockIcon from '../assets/imagenes/lock.png';
import userIcon from '../assets/imagenes/user.png';
import eyeoIcon from '../assets/imagenes/eyeo.png';
const API_URL = import.meta.env.VITE_API_URL;
console.log("¿Cuál es la URL que estoy usando?:", API_URL); // <--- PON ESTO
const Login = () => {

  const [numControl, setNumControl] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [numControlRecuperacion, setNumControlRecuperacion] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState('');


  const handleLogin = async (e) => {

    e.preventDefault();

    setError('');
    setCargando(true);

    try {

      const respuesta = await axios.post(
        `${API_URL}/api/auth/login`, {
        num_control: numControl,
        password: password
      }
      );

      const datosUsuario = respuesta.data.usuario;

      localStorage.setItem(
        'usuario_sgn',
        JSON.stringify(datosUsuario)
      );

      if (datosUsuario.rol === 'Administrador') {

        window.location.href =
          '/#/Nombrador/Principal';

      } else if (datosUsuario.rol === 'Trabajador') {

        window.location.href =
          '/#/Trabajador/Dashboard';

      }

    } catch (err) {

      if (
        err.response &&
        err.response.data &&
        err.response.data.error
      ) {

        setError(
          err.response.data.error
        );

      } else {

        setError(
          'Error al conectar con el servidor.'
        );

      }

    } finally {

      setCargando(false);

    }
  };

  // ======================================================
  // RECUPERAR PASSWORD
  // ======================================================

  /* const handleRecuperarPassword = async (e) => {
  
    e.preventDefault();
  
    setMensajeRecuperacion('');
  
    try {
  
      const respuesta = await axios.post(
        `${API_URL}/api/auth/recuperar-password`,
        {
          num_control: numControlRecuperacion,
          nuevaPassword: nuevaPassword
        }
      );
  
      setMensajeRecuperacion(
        respuesta.data.mensaje
      );
  
      // Limpiar campos
      setNumControlRecuperacion('');
      setNuevaPassword('');
  
    } catch (err) {
  
      if (err.response?.data?.error) {
  
        setMensajeRecuperacion(
          err.response.data.error
        );
  
      } else {
  
        setMensajeRecuperacion(
          'Error del servidor'
        );
  
      }
    }
  };
   */

  return (
    <div className="relative min-h-screen">

      {/* VIDEO DE FONDO */}
      <video
        id="videoFondo"
        autoPlay
        loop
        muted
      >
        <source
          src="/videos/fondo.mp4"
          type="video/mp4"
        />
      </video>

      {/* OVERLAY */}
      <div className="overlay"></div>

      {/* CONTENEDOR */}
      <div className="login-container">

        <img
          src={logo1}
          alt="Logo CPV"
          className="logo"
        />

        <h1>
          Sistema Gestor de Nombramientos
        </h1>

        <p>
          Inicio de sesión del sistema
        </p>

        {/* ======================================================
            LOGIN
        ====================================================== */}

        <form onSubmit={handleLogin}>

          <label className="block mt-4 text-sm font-semibold text-slate-800">
            Matrícula / Número de Control
          </label>

          <div className="input-group">

            <img
              src={userIcon}
              className="icono"
              alt="user"
            />

            <input
              className="w-full transition duration-200 focus:border-slate-950 focus:ring-2 focus:ring-slate-200 outline-none"
              type="text"
              placeholder="Ingrese su matrícula"
              value={numControl}
              onChange={(e) =>
                setNumControl(e.target.value)
              }
              required
            />

          </div>

          <label className="block mt-4 text-sm font-semibold text-slate-800">
            Contraseña
          </label>

          <div className="input-group">

            <img
              src={lockIcon}
              className="icono"
              alt="lock"
            />

            <input
              className="w-full transition duration-200 focus:border-slate-950 focus:ring-2 focus:ring-slate-200 outline-none"
              type={
                verPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <img
              src={eyeoIcon}
              className="ojo"
              alt="eye"
              onClick={() => setVerPassword(!verPassword)}
            />

          </div>

          {/* ERROR LOGIN */}

          {error && (
            <p className="mt-3 text-sm font-semibold text-red-500 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 mt-6 text-sm font-semibold text-white bg-slate-950 rounded-xl transition duration-200 ease-in-out hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {cargando
              ? 'Iniciando sesión...'
              : 'Iniciar sesión'}
          </button>

        </form>

        {/* FOOTER */}

        <div className="soporte">
          © 2026 Departamento de Nombramientos
        </div>

      </div>

    </div>
  );
};

export default Login;