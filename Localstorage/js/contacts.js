/* contacts.js — Agenda (con localStorage). */
window.Alke = window.Alke || {};
(function (Alke) {
  "use strict";
  const { data } = Alke;
  const listar = () => { const u = data.usuarioActual(); return u ? u.contactos : []; };
  function agregar(nombre, cuenta) {
    data.usuarioActual().contactos.push({ nombre, cuenta });
    data.guardarEnStorage();
  }
  const buscar = (texto) => { const t = texto.toLowerCase(); return listar().filter((c) => c.nombre.toLowerCase().includes(t)); };
  Alke.contacts = { listar, agregar, buscar };
})(window.Alke);