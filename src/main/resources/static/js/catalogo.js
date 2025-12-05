const API_PRODUCTOS = "http://localhost:8080/jardineria/productos";
const API_CARRITO = "http://localhost:8080/carrito";
const API_CATEGORIAS = "http://localhost:8080/jardineria/categorias";

// Verificar si hay usuario logueado
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    alert("Debes iniciar sesión para acceder a esta página");
    window.location.href = "login.html";
    throw new Error("No hay usuario logueado");
}
const usuarioId = usuario.id;

// ---- Cerrar sesión ----
const btnCerrarSesion = document.createElement("button");
btnCerrarSesion.textContent = "Cerrar sesión";
btnCerrarSesion.className = "btn btn-warning ms-2";
btnCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    alert("Sesión cerrada");
    window.location.href = "login.html";
});
document.querySelector(".d-flex").appendChild(btnCerrarSesion);

// ---- Cargar categorías para formulario ----
async function cargarCategorias() {
    try {
        const res = await fetch(API_CATEGORIAS);
        const categorias = await res.json();

        const select = document.getElementById("categoria");
        select.innerHTML = '<option value="">Seleccione una categoría</option>';

        categorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Error cargando categorías:", err);
    }
}
cargarCategorias();

// ---- Mostrar formulario y crear producto (solo admin) ----
if (usuario.rol === "admin") {
    const btnCrear = document.getElementById("btn-crear-producto");
    btnCrear.style.display = "inline-block";

    btnCrear.addEventListener("click", () => {
        document.getElementById("form-crear-producto").style.display = "block";
    });

    document.getElementById("btn-submit-producto").addEventListener("click", async () => {
        const nombre = document.getElementById("nombre").value;
        const descripcion = document.getElementById("descripcion").value;
        const precio = parseFloat(document.getElementById("precio").value);
        const stock = parseInt(document.getElementById("stock").value);
        const categoriaId = parseInt(document.getElementById("categoria").value);

        if (!categoriaId) {
            alert("Selecciona una categoría");
            return;
        }

        try {
            const res = await fetch(API_PRODUCTOS, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                    descripcion,
                    precio,
                    stock,
                    categoria: { id: categoriaId }
                })
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

// ---- Botón ver carrito ----
document.getElementById("btn-ver-carrito").addEventListener("click", () => {
    window.location.href = "carrito.html";
});

// ---- Cargar productos ----
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
                        ${usuario.rol === "admin" ? `<button class="btn btn-danger mt-2" onclick="eliminarProducto(${p.id})">Eliminar</button>` : ""}
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error("Error al cargar productos:", err);
    }
}

// ---- Eliminar producto ----
async function eliminarProducto(productoId) {
    if (usuario.rol !== "admin") {
        alert("No tienes permisos para eliminar productos");
        return;
    }
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
        const res = await fetch(`${API_PRODUCTOS}/${productoId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (res.ok) {
            alert("Producto eliminado correctamente");
            cargarProductos();
        } else {
            const msg = await res.text();
            alert("Error al eliminar producto: " + msg);
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión");
    }
}

// ---- Añadir producto al carrito ----
async function añadirAlCarrito(productoId) {
    try {
        const res = await fetch(`${API_CARRITO}/${usuarioId}/agregar?productoId=${productoId}&cantidad=1`, {
            method: "POST",
            credentials: "include"
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

// ---- Inicializar ----
cargarProductos();
