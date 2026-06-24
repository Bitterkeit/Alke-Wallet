/* data.js — Estado EN MEMORIA (parte vacío; lo llena el archivo). */
window.Alke = window.Alke || {};
(function (Alke) {
  "use strict";
  const estado = { usuarios: [], sesion: null };

  const setUsuarios = (lista) => { estado.usuarios = lista; };
  const listarUsuarios = () => estado.usuarios;
  const usuarioActual = () => estado.sesion;
  const iniciarSesion = (usuario) => { estado.sesion = usuario; };
  const cerrarSesion = () => { estado.sesion = null; };
  const buscarCredenciales = (email, password) =>
    estado.usuarios.find((u) => u.email === email && u.password === password) || null;

  Alke.data = { setUsuarios, listarUsuarios, usuarioActual, iniciarSesion, cerrarSesion, buscarCredenciales };
})(window.Alke);