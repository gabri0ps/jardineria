const API_PRODUCTOS = "http://localhost:8080/jardineria/productos";
const API_CARRITO = "http://localhost:8080/carrito"; // Ajustado al controller actual

// Obtener usuario desde localStorage
let usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    alert("Debes iniciar sesión para acceder al catálogo");
    window.location.href = "login.html";
}

// Cargar productos desde el backend
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
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="card-text">${p.descripcion || ''}</p>
                        <p class="card-text fw-bold">€${p.precio.toFixed(2)}</p>
                        <p class="card-text text-muted">Stock: ${p.stock}</p>
                        <button class="btn btn-primary mt-auto" onclick="añadirAlCarrito(${p.id})">
                            Añadir al carrito
                        </button>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// Agregar producto al carrito
async function añadirAlCarrito(productoId) {
    try {
        const url = `${API_CARRITO}/${usuario.id}/agregar?productoId=${productoId}&cantidad=1`;
        const res = await fetch(url, { method: "POST" });

        if (res.ok) {
            alert("Producto añadido al carrito");
        } else {
            alert("No se pudo añadir el producto al carrito");
        }
    } catch (error) {
        console.error("Error al añadir al carrito:", error);
    }
}

// Botón para abrir carrito
document.getElementById("btn-ver-carrito").addEventListener("click", () => {
    window.location.href = "carrito.html";
});

// Inicializar productos al cargar la página
cargarProductos();
