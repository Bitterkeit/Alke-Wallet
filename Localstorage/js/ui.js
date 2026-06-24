/* ui.js — Presentación: formatos, mensajes y saldo. */
window.Alke = window.Alke || {};
(function (Alke) {
  "use strict";
  const formatoPesos = (n) => `$ ${Number(n).toLocaleString("es-CL")}`;
  const formatoFecha = (ts) => new Date(ts).toLocaleDateString("es-CL");
  function montoValido(valor) {
    const monto = Number(valor);
    if (!monto || monto <= 0 || !isFinite(monto)) return null;
    return monto;
  }
  function mensaje(id, tipo, texto) {
    const caja = document.getElementById(id);
    if (!caja) return;
    caja.className = `alert alert-${tipo}`;
    caja.textContent = texto;
    $(caja).hide().fadeIn(150);
  }
  function pintarSaldo() {
    const u = Alke.data.usuarioActual();
    if (!u) return;
    const texto = formatoPesos(u.saldo);
    document.querySelectorAll(".js-balance, #balance").forEach((el) => { el.textContent = texto; });
  }
  Alke.ui = { formatoPesos, formatoFecha, montoValido, mensaje, pintarSaldo };
})(window.Alke);