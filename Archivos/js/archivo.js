/* archivo.js — Repositorio de ARCHIVO: leer, serializar, descargar y subir.
   Es el único módulo que sabe de fetch/Blob/FileReader. */
window.Alke = window.Alke || {};
(function (Alke) {
  "use strict";
  const { data } = Alke;
  const RUTA = "data/usuarios.json";

  // Leer el archivo inicial (requiere servidor, p.ej. Live Server).
  function cargarIniciales() {
    return fetch(RUTA)
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((d) => { data.setUsuarios(d.usuarios || []); });
  }

  const serializar = () => JSON.stringify({ usuarios: data.listarUsuarios() }, null, 2);

  // Guardar = descargar un archivo JSON.
  function guardar() {
    const blob = new Blob([serializar()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "alke-wallet.json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // Cargar = leer un archivo subido por el usuario.
  function leerSubido(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        try { const d = JSON.parse(r.result); data.setUsuarios(d.usuarios || []); resolve(); }
        catch (e) { reject(e); }
      };
      r.readAsText(file);
    });
  }

  Alke.archivo = { cargarIniciales, serializar, guardar, leerSubido };
})(window.Alke);