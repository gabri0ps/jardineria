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
    alert("Debes iniciar sesión");
    window.location.href = "login.html";
    throw new Error("No hay usuario logueado");
}
const usuarioId = usuario.id;


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
    const res = await fetch(API_CATEGORIAS);
    const categorias = await res.json();

    const select = document.getElementById("categoria");
    select.innerHTML = `<option value="">Selecciona categoría</option>`;

    categorias.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
}

/* ===============================
   CARGAR CATEGORÍAS (FILTRO)
================================ */
async function cargarCategoriasFiltro() {
    const res = await fetch(API_CATEGORIAS);
    const categorias = await res.json();

    const filtro = document.getElementById("filtroCategoria");
    filtro.innerHTML = `<option value="">Todas</option>`;

    categorias.forEach(c => {
        filtro.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
}

/* ===============================
   RENDERIZAR PRODUCTOS
================================ */
function renderizarProductos(productos) {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    productos.forEach(p => {
        contenedor.innerHTML += `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${p.imagen || '/img/default.png'}" class="card-img-top">
                <div class="card-body d-flex flex-column">
                    <h5>${p.nombre}</h5>
                    <p>${p.descripcion || ""}</p>
                    <p class="fw-bold">${p.precio.toFixed(2)} €</p>
                    <p class="text-muted">Stock: ${p.stock}</p>

                    <button class="btn btn-primary mt-auto"
                        onclick="añadirAlCarrito(${p.id})">
                        Añadir al carrito
                    </button>

                    ${usuario.rol === "admin" ? `
                        <button class="btn btn-warning mt-2"
                            onclick="editarProducto(${p.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-danger mt-2"
                            onclick="eliminarProducto(${p.id})">
                            🗑 Eliminar
                        </button>
                    ` : ""}
                </div>
            </div>
        </div>`;
    });
}

/* ===============================
   CARGAR PRODUCTOS
================================ */
async function cargarProductos() {
    const res = await fetch(API_PRODUCTOS);
    const productos = await res.json();
    renderizarProductos(productos);
}

/* ===============================
   EDITAR PRODUCTO
================================ */
async function editarProducto(id) {
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
        alert("Selecciona una categoría");
        return;
    }

    const url = productoEditandoId
        ? `${API_PRODUCTOS}/${productoEditandoId}`
        : API_PRODUCTOS;

    const method = productoEditandoId ? "PUT" : "POST";

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
        })
    });

    if (!res.ok) {
        alert("Error: " + await res.text());
        return;
    }

    alert(productoEditandoId ? "Producto actualizado" : "Producto creado");

    productoEditandoId = null;
    imagenActual = null;

    document.getElementById("btn-submit-producto").textContent = "Guardar Producto";
    document.getElementById("form-crear-producto").style.display = "none";

    cargarProductos();
});

/* ===============================
   ELIMINAR PRODUCTO (ADMIN)
================================ */
async function eliminarProducto(id) {
    if (!confirm("¿Eliminar producto?")) return;

    const res = await fetch(`${API_PRODUCTOS}/${id}`, { method: "DELETE" });
    if (res.ok) {
        alert("Producto eliminado");
        cargarProductos();
    }
}

/* ===============================
   AÑADIR AL CARRITO
================================ */
async function añadirAlCarrito(id) {
    const res = await fetch(`${API_CARRITO}/${usuarioId}/agregar?productoId=${id}&cantidad=1`, {
        method: "POST"
    });

    if (res.ok) alert("Producto añadido al carrito");
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
            .then(renderizarProductos);
    }
});

/* ===============================
   INICIALIZAR
================================ */
cargarCategorias();
cargarCategoriasFiltro();
cargarProductos();
