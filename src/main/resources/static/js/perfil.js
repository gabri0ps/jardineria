const API_USUARIOS = "http://localhost:8080/jardineria/usuarios";

/* ===============================
   Mensajes
================================ */
function mostrarMensaje(msg) {
    const dialog = document.getElementById("dialogMensaje");
    document.getElementById("mensajeTexto").textContent = msg;
    dialog.showModal();
}

document.getElementById("cerrarMensaje").addEventListener("click", () => {
    document.getElementById("dialogMensaje").close();
});

/* ===============================
   Cargar usuario desde localStorage
================================ */
let usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    window.location.href = "login.html";
}

document.getElementById("nombre").value = usuario.nombre;
document.getElementById("email").value = usuario.email;

// 👇 GUARDAMOS VALORES ORIGINALES
let emailOriginal = usuario.email;
let nombreOriginal = usuario.nombre;


/* ===============================
   Validación de contraseña
================================ */
function validarPassword(password) {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una mayúscula";
    if (!/[a-z]/.test(password)) return "La contraseña debe contener al menos una minúscula";
    if (!/\d/.test(password)) return "La contraseña debe contener al menos un número";
    if (!/[@$!%*?&]/.test(password)) return "La contraseña debe contener al menos un carácter especial (@$!%*?&)";
    return null; // válida
}

/* ===============================
   Guardar cambios
================================ */
document.getElementById("btn-guardar").addEventListener("click", async () => {

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !email) {
        mostrarMensaje("Nombre y email son obligatorios");
        return;
    }

    // Validar contraseña si se ha introducido
    if (password) {
        const error = validarPassword(password);
        if (error) {
            mostrarMensaje(error);
            return;
        }
    }

    // Crear objeto a enviar
    const datos = {
        id: usuario.id,
        nombre,
        email
    };
    if (password) datos.password = password;


    try {
        const res = await fetch(`${API_USUARIOS}/perfil`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(datos)
        });

        if (res.status === 409) {
            mostrarMensaje("❌ Ese email ya está en uso");

            document.getElementById("email").value = emailOriginal;
            document.getElementById("nombre").value = nombreOriginal;

            return;
        }


        if (!res.ok) {
            mostrarMensaje("Error al actualizar perfil");
            return;
        }

        const usuarioActualizado = await res.json();
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
        usuario = usuarioActualizado;

        document.getElementById("password").value = "";
        mostrarMensaje("✅ Perfil actualizado correctamente");

    } catch (err) {
        console.error(err);
        mostrarMensaje("Error de conexión");
    }
});
