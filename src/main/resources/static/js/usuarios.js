const API_USUARIOS = "/jardineria/usuarios";

document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value
  };
  const res = await fetch(API_USUARIOS, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(usuario)
  });
  const data = await res.json();
  alert(`Usuario ${data.nombre} registrado`);
  e.target.reset();
});
