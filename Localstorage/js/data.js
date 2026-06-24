/* data.js — Estado EN MEMORIA con datos iniciales + localStorage */
window.Alke = window.Alke || {};
(function (Alke) {
    "use strict";

    const STORAGE_KEY = 'alke_wallet_data';
    const SESSION_KEY = 'alke_wallet_session';

    // Datos iniciales de prueba
    const USUARIOS_INICIALES = [
        {
            nombre: "Camila Soto",
            email: "demo@alke.cl",
            password: "123456",
            saldo: 1250000,
            contactos: [
                { nombre: "Diego Rojas", cuenta: "CL-1001" },
                { nombre: "Valentina Pérez", cuenta: "CL-1002" },
                { nombre: "Matías Díaz", cuenta: "CL-1003" },
                { nombre: "Fernanda Soto", cuenta: "CL-1004" }
            ],
            movimientos: [
                { id: 1, ts: 1749600000000, tipo: "deposito", detalle: "Depósito inicial", monto: 1000000 },
                { id: 2, ts: 1749686400000, tipo: "envio", detalle: "Envío a Diego Rojas", monto: 50000 },
                { id: 3, ts: 1749772800000, tipo: "recepcion", detalle: "Pago recibido", monto: 300000 }
            ]
        },
        {
            nombre: "Ana Reyes",
            email: "ana@alke.cl",
            password: "123456",
            saldo: 540000,
            contactos: [{ nombre: "Camila Soto", cuenta: "CL-2001" }],
            movimientos: []
        }
    ];

    let estado = { usuarios: [], sesion: null };

    // Función para inicializar datos si no existen
    function inicializarDatos() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                estado.usuarios = parsed.usuarios || [];
            } else {
                // Si no hay datos en localStorage, usar los iniciales
                estado.usuarios = JSON.parse(JSON.stringify(USUARIOS_INICIALES));
                guardarEnStorage();
            }

            // Cargar sesión
            const session = localStorage.getItem(SESSION_KEY);
            if (session) {
                const parsed = JSON.parse(session);
                estado.sesion = parsed;
            }
        } catch (e) {
            console.warn('Error cargando datos:', e);
            estado.usuarios = JSON.parse(JSON.stringify(USUARIOS_INICIALES));
            guardarEnStorage();
        }
    }

    function guardarEnStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ usuarios: estado.usuarios }));
            if (estado.sesion) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(estado.sesion));
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        } catch (e) {
            console.warn('Error guardando datos:', e);
        }
    }

    const setUsuarios = (lista) => { estado.usuarios = lista; guardarEnStorage(); };
    const listarUsuarios = () => estado.usuarios;
    const usuarioActual = () => estado.sesion;
    const iniciarSesion = (usuario) => { 
        estado.sesion = usuario; 
        guardarEnStorage(); 
    };
    const cerrarSesion = () => { 
        estado.sesion = null; 
        guardarEnStorage(); 
    };
    const buscarCredenciales = (email, password) =>
        estado.usuarios.find((u) => u.email === email && u.password === password) || null;

    // Inicializar al cargar
    inicializarDatos();

    Alke.data = {
        setUsuarios,
        listarUsuarios,
        usuarioActual,
        iniciarSesion,
        cerrarSesion,
        buscarCredenciales,
        guardarEnStorage
    };
})(window.Alke);