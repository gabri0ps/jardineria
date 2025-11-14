const API_USUARIOS = "http://localhost:8080/jardineria/usuarios";

document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    direccion: document.getElementById("direccion").value,
    telefono: document.getElementById("telefono").value,
    rol: "CLIENTE"
  };

  try {
    const res = await fetch(API_USUARIOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });

    if (!res.ok) throw new Error("Error al registrar usuario");

    const data = await res.json();
    alert(`Usuario ${data.nombre} registrado correctamente`);
    e.target.reset();

  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo registrar el usuario");
  }
});
