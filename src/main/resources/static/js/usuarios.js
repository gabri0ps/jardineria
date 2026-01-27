const API_USUARIOS = "/jardineria/usuarios/registro";


document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    direccion: document.getElementById("direccion")?.value,
    telefono: document.getElementById("telefono")?.value,
    rol: "cliente"
  };

  try {
    const res = await fetch(API_USUARIOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });

    if (res.status === 409) {
      mostrarMensaje("❌ Ese email ya está registrado. Usa otro diferente.");
      return;
    }

    if (!res.ok) {
      const error = await res.text();
      mostrarMensaje("❌ Error al registrar usuario: " + error);
      return;
    }


    const data = await res.text();
    mostrarMensaje(data);
    e.target.reset();

  } catch (err) {
    mostrarMensaje("Error: " + err.message);
  }


});
