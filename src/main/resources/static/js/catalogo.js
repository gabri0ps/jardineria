const API_PRODUCTOS = "http://localhost:8080/jardineria/productos";

async function cargarProductos() {
    try {
        const res = await fetch(API_PRODUCTOS);
        const productos = await res.json();
        const contenedor = document.getElementById("productos");
        contenedor.innerHTML = "";

        productos.forEach(p => {
            const card = document.createElement("div");
            card.className = "col-md-4";
            card.innerHTML = `
                <div class="card h-100">
                    <img src="${p.imagen || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${p.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="card-text">${p.descripcion || ''}</p>
                        <p class="card-text fw-bold">€${p.precio.toFixed(2)}</p>
                        <p class="card-text text-muted">Stock: ${p.stock}</p>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

cargarProductos();
