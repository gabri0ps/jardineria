const API_PRODUCTOS = "/jardineria/productos";

async function listarProductos() {
  const res = await fetch(API_PRODUCTOS);
  const productos = await res.json();
  const container = document.getElementById("productos");
  container.innerHTML = "";

  productos.forEach(p => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-3";
    card.innerHTML = `
      <div class="card h-100">
        <img src="${p.imagen || 'img/default.png'}" class="card-img-top" alt="${p.nombre}">
        <div class="card-body">
          <h5 class="card-title">${p.nombre}</h5>
          <p class="card-text">$${p.precio}</p>
          <button class="btn btn-primary" onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio})">Agregar al carrito</button>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

function agregarAlCarrito(productoId) {
    fetch(`/carrito/${usuarioId}/agregar?productoId=${productoId}&cantidad=1`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(() => alert("Producto añadido al carrito"));
}


window.onload = listarProductos;
