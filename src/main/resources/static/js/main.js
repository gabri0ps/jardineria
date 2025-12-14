const API_URL = "/jardineria/productos";

async function listarProductos() {
  const response = await fetch(API_URL);
  const productos = await response.json();

  const container = document.getElementById("productos");
  container.innerHTML = ""; // limpiar contenido

  productos.forEach(p => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-3";
    card.innerHTML = `
      <div class="card h-100">
        <img src="${p.imagen || 'img/default.png'}" class="card-img-top" alt="${p.nombre}">
        <div class="card-body">
          <h5 class="card-title">${p.nombre}</h5>
          <p class="card-text">$${p.precio}</p>
          <button class="btn btn-primary">Agregar al carrito</button>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// Ejecutar al cargar la página
window.onload = listarProductos;
