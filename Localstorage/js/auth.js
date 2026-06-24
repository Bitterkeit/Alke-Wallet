/* auth.js — Login / logout (con localStorage). */
window.Alke = window.Alke || {};
(function (Alke) {
  "use strict";
  const { data } = Alke;
  function login(email, password) {
    const usuario = data.buscarCredenciales(email, password);
    if (!usuario) return { ok: false, error: "Correo o contraseña incorrectos." };
    data.iniciarSesion(usuario);
    return { ok: true };
  }
  const logout = () => data.cerrarSesion();
  Alke.auth = { login, logout };
})(window.Alke);