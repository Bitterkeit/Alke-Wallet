/* contacts.js — Agenda (con localStorage). */
window.Alke = window.Alke || {};
(function (Alke) {
    "use strict";
    const { data } = Alke;

    const listar = () => {
        const u = data.usuarioActual();
        return u ? u.contactos : [];
    };

    function agregar(nombre, cuenta) {
        const u = data.usuarioActual();
        if (!u) return;

        // Verificar si el contacto ya existe
        const existe = u.contactos.some(c => c.nombre === nombre);
        if (existe) {
            console.warn('El contacto ya existe:', nombre);
            return;
        }

        u.contactos.push({ 
            nombre: nombre, 
            cuenta: cuenta,
            alias: document.getElementById('newAlias')?.value?.trim() || '',
            banco: document.getElementById('newBank')?.value?.trim() || ''
        });
        data.guardarEnStorage();
    }

    const buscar = (texto) => {
        const t = texto.toLowerCase();
        return listar().filter((c) => c.nombre.toLowerCase().includes(t));
    };

    Alke.contacts = { listar, agregar, buscar };
})(window.Alke);