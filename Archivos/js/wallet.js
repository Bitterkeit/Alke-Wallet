/* wallet.js — Operaciones de saldo (mutan el usuario en memoria). */
window.Alke = window.Alke || {};
(function (Alke) {
  "use strict";
  const { data } = Alke;
  const INGRESOS = ["deposito", "recepcion"];
  function registrar(u, tipo, detalle, monto) {
    u.movimientos.push({ id: Date.now(), ts: Date.now(), tipo, detalle, monto });
  }
  function depositar(monto) {
    const u = data.usuarioActual();
    u.saldo += monto; registrar(u, "deposito", "Depósito a tu cuenta", monto);
    return { ok: true, saldo: u.saldo };
  }
  function retirar(monto) {
    const u = data.usuarioActual();
    if (monto > u.saldo) return { ok: false, error: "Saldo insuficiente para ese retiro." };
    u.saldo -= monto; registrar(u, "retiro", "Retiro de fondos", monto);
    return { ok: true, saldo: u.saldo };
  }
  function transferir(destino, monto) {
    const u = data.usuarioActual();
    if (monto > u.saldo) return { ok: false, error: "Saldo insuficiente para esta transferencia." };
    u.saldo -= monto; registrar(u, "envio", `Envío a ${destino}`, monto);
    return { ok: true, saldo: u.saldo };
  }
  Alke.wallet = { depositar, retirar, transferir, INGRESOS };
})(window.Alke);