function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const tbody = document.querySelector("#tablaCarrito tbody");
  tbody.innerHTML = "";
  carrito.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>$${p.precio}</td>
      <td><button class="btn btn-danger" onclick="eliminar(${i})">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function eliminar(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
}

window.onload = mostrarCarrito;
