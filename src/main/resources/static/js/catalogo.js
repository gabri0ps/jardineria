const API_PRODUCTOS = "http://localhost:8080/jardineria/productos";
const API_CARRITO = "http://localhost:8080/carrito";
const API_CATEGORIAS = "http://localhost:8080/jardineria/categorias";

let productoEditandoId = null;
let imagenActual = null;
let todosProductos = []; // Guardamos todos los productos para filtrar

/* ===============================
   Función mostrar mensaje
================================ */
function mostrarMensaje(msg) {
    // Muestra el mensaje en el dialogo o alert
    const dialog = document.getElementById("dialogMensaje");
    const texto = document.getElementById("mensajeTexto");
    texto.textContent = msg;
    dialog.showModal();
}

document.getElementById("cerrarMensaje").addEventListener("click", () => {
    document.getElementById("dialogMensaje").close();
});

/* ===============================
   VERIFICAR USUARIO
================================ */
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    mostrarMensaje("Debes iniciar sesión");
    window.location.href = "login.html";
    throw new Error("No hay usuario logueado");
}
const usuarioId = usuario.id;

/* ===============================
   BOTONES ADMIN
================================ */
const btnCrearProducto = document.getElementById("btn-crear-producto");
if (usuario.rol === "admin") {
    btnCrearProducto.style.display = "inline-block";
}
btnCrearProducto.addEventListener("click", () => {
    productoEditandoId = null;
    imagenActual = null;

    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("categoria").value = "";

    document.getElementById("btn-submit-producto").textContent = "Guardar Producto";
    document.getElementById("form-crear-producto").style.display = "block";
});

/* ===============================
   CERRAR SESIÓN
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
   BOTONES CARRITO Y PEDIDOS
================================ */
document.getElementById("btn-ver-carrito").addEventListener("click", () => {
    window.location.href = "carrito.html";
});
document.getElementById("btn-pedidos").addEventListener("click", () => {
    window.location.href = "pedidos.html";
});

/* ===============================
   CARGAR CATEGORÍAS
================================ */
async function cargarCategorias() {
    try {
        const res = await fetch(API_CATEGORIAS);
        const categorias = await res.json();
        const select = document.getElementById("categoria");
        select.innerHTML = `<option value="">Selecciona categoría</option>`;
        categorias.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
    } catch (err) {
        console.error("Error al cargar categorías:", err);
    }
}

async function cargarCategoriasFiltro() {
    try {
        const res = await fetch(API_CATEGORIAS);
        const categorias = await res.json();
        const filtro = document.getElementById("filtroCategoria");
        filtro.innerHTML = `<option value="">Todas</option>`;
        categorias.forEach(c => filtro.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
    } catch (err) {
        console.error("Error al cargar categorías (filtro):", err);
    }
}

/* ===============================
   CARGAR PRODUCTOS
================================ */
async function cargarProductos() {
    try {
        const res = await fetch(API_PRODUCTOS);
        todosProductos = await res.json();
        renderizarProductos(todosProductos);
    } catch (err) {
        console.error("Error al cargar productos:", err);
    }
}

/* ===============================
   RENDERIZAR PRODUCTOS
================================ */
function renderizarProductos(productos) {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.innerHTML = `<p class="text-center">No hay productos que coincidan con los filtros</p>`;
        return;
    }

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
                        <button class="btn btn-warning mt-2" onclick="editarProducto(${p.id})">✏️ Editar</button>
                        <button class="btn btn-danger mt-2" onclick="eliminarProducto(${p.id})">🗑 Eliminar</button>
                    ` : ""}
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
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
        console.error(err);
        mostrarMensaje("Error al cargar producto para edición");
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

    const url = productoEditandoId ? `${API_PRODUCTOS}/${productoEditandoId}` : API_PRODUCTOS;
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
        console.error(err);
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
            mostrarMensaje("Error al eliminar producto");
        }
    } catch (err) {
        console.error(err);
        mostrarMensaje("Error al eliminar producto");
    }
}

/* ===============================
   AÑADIR AL CARRITO
================================ */
async function añadirAlCarrito(id) {
    if (!usuarioId) {
        mostrarMensaje("Debes iniciar sesión para añadir productos");
        return;
    }

    try {
        const res = await fetch(`${API_CARRITO}/${usuarioId}/agregar?productoId=${id}&cantidad=1`, {
            method: "POST",
            credentials: "include"
        });
        if (res.ok) mostrarMensaje("Producto añadido al carrito");
        else mostrarMensaje("No se pudo añadir el producto al carrito");
    } catch (err) {
        console.error(err);
        mostrarMensaje("Error al añadir producto al carrito");
    }
}

/* ===============================
   FILTRAR / ORDENAR
================================ */
document.getElementById("btn-aplicar-filtros").addEventListener("click", () => {
    let filtrados = [...todosProductos];

    const categoriaId = document.getElementById("filtroCategoria").value;
    const criterio = document.getElementById("criterioOrden").value;
    const direccion = document.getElementById("ordenDireccion").value;

    // Filtrar por categoría
    if (categoriaId) {
        filtrados = filtrados.filter(p => p.categoria.id == categoriaId);
    }

    // Ordenar (solo UN criterio)
    if (criterio && direccion) {
        filtrados.sort((a, b) => {
            const valorA = a[criterio];
            const valorB = b[criterio];

            return direccion === "asc"
                ? valorA - valorB
                : valorB - valorA;
        });
    }

    renderizarProductos(filtrados);
});


document.getElementById("btn-filtrar-precio").addEventListener("click", () => {
    const min = parseFloat(document.getElementById("precioMin").value) || 0;
    const max = parseFloat(document.getElementById("precioMax").value) || Infinity;

    const filtrados = todosProductos.filter(p => p.precio >= min && p.precio <= max);
    renderizarProductos(filtrados);
});

/* ===============================
   INICIALIZAR
================================ */
cargarCategorias();
cargarCategoriasFiltro();
cargarProductos();
