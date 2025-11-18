const API_LOGIN = "/jardineria/auth/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

    try {
        const res = await fetch(API_LOGIN, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const usuario = await res.json();
            alert(`Bienvenido, ${usuario.nombre}`);
            window.location.href = "/"; // Redirige a la página principal
        } else {
            const msg = await res.text();
            errorMsg.textContent = msg;
        }
    } catch (err) {
        errorMsg.textContent = "Error en la conexión con el servidor";
        console.error(err);
    }
});
