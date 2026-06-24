/* main.js — Funciones compartidas para páginas HTML separadas. */
(function (Alke) {
  "use strict";
  const { data, ui, auth, wallet, contacts } = Alke;

  // Inicializar usuario actual
  function initUser() {
    const u = data.usuarioActual();
    if (!u) {
      window.location.href = 'login.html';
      return null;
    }
    return u;
  }

  // Actualizar UI de menú
  function updateMenu() {
    const u = initUser();
    if (!u) return;
    document.getElementById("user-name").textContent = u.nombre;
    document.getElementById("tx-count").textContent = u.movimientos.length;
    document.getElementById("contacts-count").textContent = u.contactos.length;
    const ultimo = u.movimientos[u.movimientos.length - 1];
    document.getElementById("last-movement").textContent = ultimo ? ultimo.detalle : "—";
    ui.pintarSaldo();
  }

  // Actualizar UI de depósito
  function updateDeposit() {
    const u = initUser();
    if (!u) return;
    ui.pintarSaldo();
  }

  // Actualizar UI de envío
  function updateSendMoney() {
    const u = initUser();
    if (!u) return;
    ui.pintarSaldo();
    dibujarContactos();
  }

  function dibujarContactos() {
    const lista = document.getElementById("contacts-list");
    if (!lista) return;
    const items = contacts.listar();
    lista.innerHTML = items.length
      ? items.map((c) => `<li><span>${c.nombre}</span><span class="contact-account">${c.cuenta}</span></li>`).join("")
      : '<li class="text-muted">Aún no tienes contactos.</li>';
  }

  function dibujarMovimientos() {
    const cuerpo = document.getElementById("transactions-body");
    if (!cuerpo) return;
    const u = data.usuarioActual();
    if (!u) { window.location.href = 'login.html'; return; }
    
    cuerpo.querySelectorAll("tr:not(#empty-row)").forEach((tr) => tr.remove());
    const movs = u.movimientos;
    const vacia = document.getElementById("empty-row");
    if (!movs.length) { if (vacia) vacia.style.display = ""; return; }
    if (vacia) vacia.style.display = "none";
    cuerpo.insertAdjacentHTML("beforeend", movs.slice().reverse().map((m) => {
      const ingreso = wallet.INGRESOS.includes(m.tipo);
      const signo = ingreso ? "+ " : "- ";
      const clase = ingreso ? "tx-income" : "tx-expense";
      return `<tr><td>${ui.formatoFecha(m.ts)}</td><td>${m.tipo}</td><td>${m.detalle}</td>
        <td class="text-end ${clase}">${signo}${ui.formatoPesos(m.monto)}</td></tr>`;
    }).join(""));
    ui.pintarSaldo();
  }

  // Cerrar sesión
  function setupLogout() {
    const btn = document.getElementById("logout");
    if (btn) {
      btn.addEventListener("click", () => {
        auth.logout();
        window.location.href = 'login.html';
      });
    }
  }

  // Conectar eventos de depósito
  function setupDeposit() {
    const btnDeposit = document.getElementById("btn-deposit");
    const btnWithdraw = document.getElementById("btn-withdraw");
    if (btnDeposit) {
      btnDeposit.addEventListener("click", () => {
        const monto = ui.montoValido(document.getElementById("amount").value);
        if (monto === null) return ui.mensaje("deposit-msg", "danger", "Ingresa un monto válido.");
        const r = wallet.depositar(monto);
        if (!r.ok) return ui.mensaje("deposit-msg", "danger", r.error);
        ui.pintarSaldo();
        document.getElementById("amount").value = "";
        ui.mensaje("deposit-msg", "success", `Depósito: ${ui.formatoPesos(monto)}`);
      });
    }
    if (btnWithdraw) {
      btnWithdraw.addEventListener("click", () => {
        const monto = ui.montoValido(document.getElementById("amount").value);
        if (monto === null) return ui.mensaje("deposit-msg", "danger", "Ingresa un monto válido.");
        const r = wallet.retirar(monto);
        if (!r.ok) return ui.mensaje("deposit-msg", "danger", r.error);
        ui.pintarSaldo();
        document.getElementById("amount").value = "";
        ui.mensaje("deposit-msg", "success", `Retiro: ${ui.formatoPesos(monto)}`);
      });
    }
  }

  // Conectar eventos de envío
  function setupSendMoney() {
    // Autocompletar
    $("#contact-search").on("input", function () {
      const texto = $(this).val();
      const caja = $("#contact-suggestions").empty();
      if (!texto) return;
      contacts.buscar(texto).forEach((c) => {
        $('<button type="button" class="list-group-item list-group-item-action"></button>')
          .text(`${c.nombre}  (${c.cuenta})`)
          .on("click", () => { $("#contact-search").val(c.nombre); caja.empty(); })
          .appendTo(caja);
      });
    });

    // Enviar dinero
    document.getElementById("btn-send").addEventListener("click", () => {
      const destino = document.getElementById("contact-search").value.trim();
      const monto = ui.montoValido(document.getElementById("send-amount").value);
      if (!destino) return ui.mensaje("send-msg", "danger", "Elige un contacto de destino.");
      if (monto === null) return ui.mensaje("send-msg", "danger", "Ingresa un monto válido.");
      const r = wallet.transferir(destino, monto);
      if (!r.ok) return ui.mensaje("send-msg", "danger", r.error);
      ui.pintarSaldo();
      document.getElementById("send-amount").value = "";
      document.getElementById("contact-search").value = "";
      ui.mensaje("send-msg", "success", `Enviaste ${ui.formatoPesos(monto)} a ${destino}`);
    });

    // Agregar contacto
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

  // Inicializar según página
  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    
    setupLogout();

    switch(page) {
      case 'menu':
        updateMenu();
        break;
      case 'deposit':
        updateDeposit();
        setupDeposit();
        break;
      case 'sendmoney':
        updateSendMoney();
        setupSendMoney();
        break;
      case 'transactions':
        dibujarMovimientos();
        break;
      default:
        // login o index
        break;
    }
  });
})(window.Alke);