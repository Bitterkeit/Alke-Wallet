/* main.js — Navegación (SPA), conexión de eventos y manejo de archivo. */
(function (Alke) {
  "use strict";
  const { data, archivo, ui, auth, wallet, contacts } = Alke;

  function mostrarVista(nombre) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    document.getElementById(`view-${nombre}`).classList.add("is-active");
    document.getElementById("app-shell").classList.toggle("d-none", nombre === "login");
    document.querySelectorAll(".app-navbar .nav-link").forEach((a) =>
      a.classList.toggle("active", a.getAttribute("data-view") === nombre));
    if (nombre === "menu") pintarMenu();
    if (nombre === "deposit" || nombre === "transactions") ui.pintarSaldo();
    if (nombre === "sendmoney") { ui.pintarSaldo(); dibujarContactos(); }
    if (nombre === "transactions") dibujarMovimientos();
  }

  function pintarMenu() {
    const u = data.usuarioActual();
    document.getElementById("menu-user-name").textContent = u.nombre;
    document.getElementById("menu-tx-count").textContent = u.movimientos.length;
    document.getElementById("menu-contacts-count").textContent = u.contactos.length;
    const ultimo = u.movimientos[u.movimientos.length - 1];
    document.getElementById("menu-last-movement").textContent = ultimo ? ultimo.detalle : "—";
    ui.pintarSaldo();
  }

  function dibujarContactos() {
    const lista = document.getElementById("contacts-list");
    const items = contacts.listar();
    lista.innerHTML = items.length
      ? items.map((c) => `<li><span>${c.nombre}</span><span class="contact-account">${c.cuenta}</span></li>`).join("")
      : '<li class="text-muted">Aún no tienes contactos.</li>';
  }

  function dibujarMovimientos() {
    const cuerpo = document.getElementById("transactions-body");
    cuerpo.querySelectorAll("tr:not(#empty-row)").forEach((tr) => tr.remove());
    const movs = data.usuarioActual().movimientos;
    const vacia = document.getElementById("empty-row");
    if (!movs.length) { vacia.style.display = ""; return; }
    vacia.style.display = "none";
    cuerpo.insertAdjacentHTML("beforeend", movs.slice().reverse().map((m) => {
      const ingreso = wallet.INGRESOS.includes(m.tipo);
      const signo = ingreso ? "+ " : "- ";
      const clase = ingreso ? "tx-income" : "tx-expense";
      return `<tr><td>${ui.formatoFecha(m.ts)}</td><td>${m.tipo}</td><td>${m.detalle}</td>
        <td class="text-end ${clase}">${signo}${ui.formatoPesos(m.monto)}</td></tr>`;
    }).join(""));
  }

  function conectarLogin() {
    document.getElementById("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-password").value;
      if (!email || !pass) return ui.mensaje("login-error", "danger", "Completa correo y contraseña.");
      const r = auth.login(email, pass);
      if (r.ok) mostrarVista("menu");
      else ui.mensaje("login-error", "danger", r.error);
    });
  }

  function conectarDeposito() {
    const operar = (operacion, etiqueta) => {
      const monto = ui.montoValido(document.getElementById("deposit-amount").value);
      if (monto === null) return ui.mensaje("deposit-msg", "danger", "Ingresa un monto válido (mayor a 0).");
      const r = operacion(monto);
      if (!r.ok) return ui.mensaje("deposit-msg", "danger", r.error);
      ui.pintarSaldo();
      document.getElementById("deposit-amount").value = "";
      ui.mensaje("deposit-msg", "success", `${etiqueta}: ${ui.formatoPesos(monto)}`);
    };
    document.getElementById("btn-deposit").addEventListener("click", () => operar(wallet.depositar, "Depósito realizado"));
    document.getElementById("btn-withdraw").addEventListener("click", () => operar(wallet.retirar, "Retiro realizado"));
  }

  function conectarEnviar() {
    $("#send-contact-search").on("input", function () {
      const texto = $(this).val();
      const caja = $("#send-contact-suggestions").empty();
      if (!texto) return;
      contacts.buscar(texto).forEach((c) => {
        $('<button type="button" class="list-group-item list-group-item-action"></button>')
          .text(`${c.nombre}  (${c.cuenta})`)
          .on("click", () => { $("#send-contact-search").val(c.nombre); caja.empty(); })
          .appendTo(caja);
      });
    });
    document.getElementById("btn-send").addEventListener("click", () => {
      const destino = document.getElementById("send-contact-search").value.trim();
      const monto = ui.montoValido(document.getElementById("send-amount").value);
      if (!destino) return ui.mensaje("send-msg", "danger", "Elige un contacto de destino.");
      if (monto === null) return ui.mensaje("send-msg", "danger", "Ingresa un monto válido.");
      const r = wallet.transferir(destino, monto);
      if (!r.ok) return ui.mensaje("send-msg", "danger", r.error);
      ui.pintarSaldo();
      document.getElementById("send-amount").value = "";
      document.getElementById("send-contact-search").value = "";
      ui.mensaje("send-msg", "success", `Enviaste ${ui.formatoPesos(monto)} a ${destino}`);
    });
    document.getElementById("btn-add-contact").addEventListener("click", () => {
      const nombre = document.getElementById("contact-name").value.trim();
      const cuenta = document.getElementById("contact-account").value.trim();
      if (!nombre || !cuenta) return ui.mensaje("contact-add-msg", "danger", "Completa nombre y número de cuenta.");
      contacts.agregar(nombre, cuenta);
      document.getElementById("contact-name").value = "";
      document.getElementById("contact-account").value = "";
      ui.mensaje("contact-add-msg", "success", "Contacto agregado.");
      dibujarContactos();
    });
  }

  function conectarArchivo() {
    document.getElementById("btn-save").addEventListener("click", () => archivo.guardar());
    document.getElementById("file-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      archivo.leerSubido(file)
        .then(() => { auth.logout(); mostrarVista("login"); ui.mensaje("login-error", "success", "Archivo cargado. Inicia sesión."); })
        .catch(() => ui.mensaje("login-error", "danger", "No pude leer el archivo (¿es un JSON válido?)."));
      e.target.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a[data-view]").forEach((a) =>
      a.addEventListener("click", (e) => { e.preventDefault(); mostrarVista(a.getAttribute("data-view")); }));
    document.getElementById("logout").addEventListener("click", () => { auth.logout(); mostrarVista("login"); });
    document.getElementById("btn-clear").addEventListener("click", () => { data.usuarioActual().movimientos = []; dibujarMovimientos(); });

    conectarLogin(); conectarDeposito(); conectarEnviar(); conectarArchivo();

    archivo.cargarIniciales()
      .then(() => mostrarVista("login"))
      .catch((e) => {
        console.warn("No se pudo leer el archivo inicial:", e);
        mostrarVista("login");
        ui.mensaje("login-error", "warning",
          "No pude leer el archivo. Ábrelo con Live Server, o usa 'Cargar archivo' y elige data/usuarios.json.");
      });
  });
})(window.Alke);