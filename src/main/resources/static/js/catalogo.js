const API_PRODUCTOS = "http://localhost:8080/jardineria/productos";
const API_CARRITO = "http://localhost:8080/carrito";

const usuario = JSON.parse(localStorage.getItem("usuario"));
let usuarioId = usuario ? usuario.id : null;

// Mostrar botón crear producto solo si es admin
if (usuario && usuario.rol === "admin") {
    document.getElementById("btn-crear-producto").style.display = "inline-block";

    document.getElementById("btn-crear-producto").addEventListener("click", () => {
        document.getElementById("form-crear-producto").style.display = "block";
    });

    document.getElementById("btn-submit-producto").addEventListener("click", async () => {
        const nombre = document.getElementById("nombre").value;
        const descripcion = document.getElementById("descripcion").value;
        const precio = parseFloat(document.getElementById("precio").value);
        const stock = parseInt(document.getElementById("stock").value);

        try {
            const res = await fetch(API_PRODUCTOS, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, descripcion, precio, stock })
            });

            if (res.ok) {
                alert("Producto creado correctamente");
                cargarProductos();
                document.getElementById("form-crear-producto").style.display = "none";
            } else {
                const msg = await res.text();
                alert("Error al crear producto: " + msg);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        }
    });
}

// Botón ver carrito
document.getElementById("btn-ver-carrito").addEventListener("click", () => {
    if (!usuarioId) {
        alert("Debes iniciar sesión para ver el carrito");
        return;
    }
    window.location.href = "carrito.html";
});

// Cargar productos
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
    } catch (err) {
        console.error("Error al cargar productos:", err);
    }
}

// Añadir producto al carrito
async function añadirAlCarrito(productoId) {
    if (!usuarioId) {
        alert("Debes iniciar sesión para añadir productos al carrito");
        return;
    }

    try {
        const res = await fetch(`${API_CARRITO}/${usuarioId}/agregar?productoId=${productoId}&cantidad=1`, {
            method: "POST",
            credentials: "include"   // por si el carrito usa sesión también
        });

        if (res.ok) {
            alert("Producto añadido al carrito");
        } else {
            alert("No se pudo añadir el producto al carrito");
        }
    } catch (err) {
        console.error(err);
        alert("Error al añadir producto al carrito");
    }
}

cargarProductos();
