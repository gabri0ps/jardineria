const API_PRODUCTOS = "http://localhost:8080/jardineria/productos";
const API_CARRITO = "http://localhost:8080/carrito";
const API_CATEGORIAS = "http://localhost:8080/jardineria/categorias";

let productoEditandoId = null;
let imagenActual = null;

/* ===============================
   VERIFICAR USUARIO LOGUEADO
================================ */
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    mostrarMensaje("Debes iniciar sesión");
    window.location.href = "login.html";
    throw new Error("No hay usuario logueado");
}
const usuarioId = usuario.id;

/* ===============================
   MOSTRAR BOTÓN CREAR PRODUCTO SI ADMIN
================================ */
if (usuario.rol === "admin") {
    document.getElementById("btn-crear-producto").style.display = "inline-block";
}

/* ===============================
   BOTÓN CREAR PRODUCTO
================================ */
document.getElementById("btn-crear-producto").addEventListener("click", () => {
    productoEditandoId = null; // crear nuevo producto
    imagenActual = null;
    document.getElementById("form-crear-producto").style.display = "block";
});

/* ===============================
   BOTÓN VER CARRITO
================================ */
document.getElementById("btn-ver-carrito").addEventListener("click", () => {
    window.location.href = "carrito.html";
});

/* ===============================
   BOTÓN VER PEDIDOS
================================ */
document.getElementById("btn-pedidos").addEventListener("click", () => {
    window.location.href = "pedidos.html";
});

/* ===============================
   BOTÓN CERRAR SESIÓN
================================ */
const btnCerrarSesion = document.createElement("button");
btnCerrarSesion.textContent = "Cerrar sesión";
btnCerrarSesion.className = "btn btn-warning ms-2";
btnCerrarSesion.onclick = () => {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
};
document.querySelector(".d-flex").appendChild(btnCerrarSesion);

/* ===============================
   CARGAR CATEGORÍAS (FORM)
================================ */
async function cargarCategorias() {
    try {
        const res = await fetch(API_CATEGORIAS);
        const categorias = await res.json();
        const select = document.getElementById("categoria");
        select.innerHTML = `<option value="">Selecciona categoría</option>`;
        categorias.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });
    } catch (err) {
        console.error("Error al cargar categorías:", err);
    }
}

/* ===============================
   CARGAR CATEGORÍAS (FILTRO)
================================ */
async function cargarCategoriasFiltro() {
    try {
        const res = await fetch(API_CATEGORIAS);
        const categorias = await res.json();
        const filtro = document.getElementById("filtroCategoria");
        filtro.innerHTML = `<option value="">Todas</option>`;
        categorias.forEach(c => {
            filtro.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });
    } catch (err) {
        console.error("Error al cargar categorías (filtro):", err);
    }
}

/* ===============================
   RENDERIZAR PRODUCTOS
================================ */
function renderizarProductos(productos) {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    productos.forEach(p => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";
        card.innerHTML = `
            <div class="card h-100">
                <img src="${p.imagen || '/img/default.png'}" class="card-img-top">
                <div class="card-body d-flex flex-column">
                    <h5>${p.nombre}</h5>
                    <p>${p.descripcion || ""}</p>
                    <p class="fw-bold">${p.precio.toFixed(2)} €</p>
                    <p class="text-muted">Stock: ${p.stock}</p>

                    <button class="btn btn-primary mt-auto" onclick="añadirAlCarrito(${p.id})">
                        Añadir al carrito
                    </button>

                    ${usuario.rol === "admin" ? `
                        <button class="btn btn-warning mt-2" onclick="editarProducto(${p.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-danger mt-2" onclick="eliminarProducto(${p.id})">
                            🗑 Eliminar
                        </button>
                    ` : ""}
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

/* ===============================
   CARGAR PRODUCTOS
================================ */
async function cargarProductos() {
    try {
        const res = await fetch(API_PRODUCTOS);
        const productos = await res.json();
        renderizarProductos(productos);
    } catch (err) {
        console.error("Error al cargar productos:", err);
    }
}

/* ===============================
   EDITAR PRODUCTO
================================ */
async function editarProducto(id) {
    try {
        const res = await fetch(`${API_PRODUCTOS}/${id}`);
        const p = await res.json();

        document.getElementById("nombre").value = p.nombre;
        document.getElementById("descripcion").value = p.descripcion;
        document.getElementById("precio").value = p.precio;
        document.getElementById("stock").value = p.stock;
        document.getElementById("categoria").value = p.categoria.id;

        productoEditandoId = p.id;
        imagenActual = p.imagen;

        document.getElementById("btn-submit-producto").textContent = "Actualizar Producto";
        document.getElementById("form-crear-producto").style.display = "block";
    } catch (err) {
        console.error("Error al editar producto:", err);
    }
}

/* ===============================
   CREAR / ACTUALIZAR PRODUCTO
================================ */
document.getElementById("btn-submit-producto").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const precio = parseFloat(document.getElementById("precio").value);
    const stock = parseInt(document.getElementById("stock").value);
    const categoriaId = parseInt(document.getElementById("categoria").value);

    if (!categoriaId) {
        mostrarMensaje("Selecciona una categoría");
        return;
    }

    const url = productoEditandoId
        ? `${API_PRODUCTOS}/${productoEditandoId}`
        : API_PRODUCTOS;
    const method = productoEditandoId ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre,
                descripcion,
                precio,
                stock,
                imagen: imagenActual || "/img/default.png",
                categoria: { id: categoriaId }
            }),
            credentials: 'include'
        });

        if (!res.ok) {
            const msg = await res.text();
            mostrarMensaje("Error: " + msg);
            return;
        }

        mostrarMensaje(productoEditandoId ? "Producto actualizado" : "Producto creado");
        productoEditandoId = null;
        imagenActual = null;

        document.getElementById("btn-submit-producto").textContent = "Guardar Producto";
        document.getElementById("form-crear-producto").style.display = "none";

        cargarProductos();
    } catch (err) {
        console.error("Error al guardar producto:", err);
        mostrarMensaje("Error al guardar producto");
    }
});

/* ===============================
   ELIMINAR PRODUCTO
================================ */
async function eliminarProducto(id) {
    if (!confirm("¿Eliminar producto?")) return;

    try {
        const res = await fetch(`${API_PRODUCTOS}/${id}`, { method: "DELETE" });
        if (res.ok) {
            mostrarMensaje("Producto eliminado");
            cargarProductos();
        } else {
            const msg = await res.text();
            mostrarMensaje("Error al eliminar producto: " + msg);
        }
    } catch (err) {
        console.error("Error al eliminar producto:", err);
        mostrarMensaje("Error al eliminar producto");
    }
}

/* ===============================
   AÑADIR AL CARRITO
================================ */
async function añadirAlCarrito(id) {
    if (!usuarioId) {
        mostrarMensaje("Debes iniciar sesión para añadir productos al carrito");
        return;
    }

    try {
        const res = await fetch(`${API_CARRITO}/${usuarioId}/agregar?productoId=${id}&cantidad=1`, {
            method: "POST",
            credentials: "include"
        });

        if (res.ok) {
            mostrarMensaje("Producto añadido al carrito");
        } else {
            mostrarMensaje("No se pudo añadir el producto al carrito");
        }
    } catch (err) {
        console.error("Error al añadir al carrito:", err);
        mostrarMensaje("Error al añadir producto al carrito");
    }
}

/* ===============================
   FILTRAR POR CATEGORÍA
================================ */
document.getElementById("filtroCategoria").addEventListener("change", e => {
    const id = e.target.value;
    if (!id) {
        cargarProductos();
    } else {
        fetch(`${API_PRODUCTOS}/categoria/${id}`)
            .then(r => r.json())
            .then(renderizarProductos)
            .catch(err => console.error("Error al filtrar productos:", err));
    }
});

/* ===============================
   INICIALIZAR
================================ */
cargarCategorias();
cargarCategoriasFiltro();
cargarProductos();
