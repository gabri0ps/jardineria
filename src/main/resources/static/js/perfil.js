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
   Cargar usuario
================================ */
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    window.location.href = "login.html";
}

document.getElementById("nombre").value = usuario.nombre;
document.getElementById("email").value = usuario.email;

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

    const datos = { id: usuario.id, nombre, email };
    if (password !== "") datos.password = password;

    try {
        const res = await fetch(`${API_USUARIOS}/perfil`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (res.status === 409) {
            mostrarMensaje("❌ Ese email ya está en uso");
            return;
        }

        if (!res.ok) {
            mostrarMensaje("Error al actualizar perfil");
            return;
        }

        const usuarioActualizado = await res.json();
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

        document.getElementById("password").value = "";
        mostrarMensaje("✅ Perfil actualizado correctamente");

    } catch (err) {
        console.error(err);
        mostrarMensaje("Error de conexión");
    }
});
