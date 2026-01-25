const API_LOGIN = "/jardineria/auth/login";

function mostrarMensaje(msg) {
    const dialog = document.getElementById("dialogMensaje");
    const texto = document.getElementById("mensajeTexto");

    texto.textContent = msg;
    dialog.showModal();
}

document.getElementById("cerrarMensaje").addEventListener("click", () => {
    document.getElementById("dialogMensaje").close();
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

    errorMsg.textContent = "";

    try {
        const res = await fetch(API_LOGIN, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const usuario = await res.json();

            // Guardar usuario
            localStorage.setItem("usuario", JSON.stringify(usuario));

            // Mostrar mensaje elegante
            mostrarMensaje(`Bienvenido, ${usuario.nombre}`);

            // Redirigir tras un pequeño delay
            setTimeout(() => {
                window.location.href = "catalogo.html";
            }, 1200);

        } else {
            const msg = await res.text();
            errorMsg.textContent = msg || "Credenciales incorrectas";
        }
    } catch (err) {
        errorMsg.textContent = "Error en la conexión con el servidor";
        console.error(err);
    }
});
