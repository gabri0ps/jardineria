const API_USUARIOS = "/jardineria/usuarios/registro"; // ✅ ruta correcta

document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,  // si agregaste password
    direccion: document.getElementById("direccion")?.value,
    telefono: document.getElementById("telefono")?.value,
    rol: "cliente" // coincide con tu enum Rol en mayúsculas
  };

  try {
    const res = await fetch(API_USUARIOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.text();
    alert(data);
    e.target.reset();

  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});
