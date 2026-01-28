const API_PRODUCTOS = "http://localhost:8080/jardineria/productos";
const API_CARRITO = "http://localhost:8080/carrito";
const API_CATEGORIAS = "http://localhost:8080/jardineria/categorias";

let productoEditandoId = null;
let imagenActual = null;
let todosProductos = []; // Productos de la página actual

// Paginación
let paginaActual = 0;
let totalPaginas = 0;
let filtros = {
    categoriaId: "",
    precioMin: 0,
    precioMax: Infinity,
    criterio: "",
    direccion: ""
};

/* ===============================
   Función mostrar mensaje
================================ */
function mostrarMensaje(msg) {
    const dialog = document.getElementById("dialogMensaje");
    const texto = document.getElementById("mensajeTexto");
    texto.textContent = msg;
    dialog.showModal();
}

document.getElementById("cerrarMensaje").addEventListener("click", () => {
    document.getElementById("dialogMensaje").close();
});

/* ===============================
   Verificar usuario
================================ */
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    mostrarMensaje("Debes iniciar sesión");
    window.location.href = "login.html";
    throw new Error("No hay usuario logueado");
}

if (usuario && usuario.rol === "admin") {
    document.getElementById("admin-actions").style.display = "flex";
}

const usuarioId = usuario.id;

/* ===============================
   Botones admin
================================ */
const btnCrearProducto = document.getElementById("btn-crear-producto");
if (usuario.rol === "admin") {
    btnCrearProducto.style.display = "inline-block";
}
btnCrearProducto.addEventListener("click", () => {
    const formProducto = document.getElementById("form-crear-producto");
    const formCategoria = document.getElementById("form-crear-categoria");

    // Cerrar categoría si está abierta
    formCategoria.style.display = "none";

    // Resetear formulario producto solo al abrir
    if (formProducto.style.display === "none") {
        productoEditandoId = null;
        imagenActual = null;

        document.getElementById("nombre").value = "";
        document.getElementById("descripcion").value = "";
        document.getElementById("precio").value = "";
        document.getElementById("stock").value = "";
        document.getElementById("categoria").value = "";
        document.getElementById("imagen").value = "";

        document.getElementById("btn-submit-producto").textContent = "Guardar Producto";
    }

    // Toggle
    formProducto.style.display =
        formProducto.style.display === "none" ? "block" : "none";
});


/* ===============================
   Cerrar sesión
================================ */
document.getElementById("btn-cerrar-sesion").addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
});


/* ===============================
   Botones carrito, pedidos y perfil
================================ */
document.getElementById("btn-ver-carrito").addEventListener("click", () => {
    window.location.href = "carrito.html";
});
document.getElementById("btn-pedidos").addEventListener("click", () => {
    window.location.href = "pedidos.html";
});
document.getElementById("btn-perfil").addEventListener("click", () => {
    window.location.href = "perfil.html";
});


/* ===============================
   Cargar categorías
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
   Cargar productos paginados
================================ */
async function cargarProductosPagina(page = 0) {
    try {
        const params = new URLSearchParams({
            page,
            size: 6
        });

        if (filtros.categoriaId) params.append("categoriaId", filtros.categoriaId);
        if (filtros.precioMin !== 0) params.append("precioMin", filtros.precioMin);
        if (filtros.precioMax !== Infinity) params.append("precioMax", filtros.precioMax);
        if (filtros.criterio) params.append("sort", filtros.criterio);
        if (filtros.direccion) params.append("dir", filtros.direccion);

        const res = await fetch(`${API_PRODUCTOS}/pagina?${params}`);
        const data = await res.json();

        todosProductos = data.productos;
        paginaActual = data.paginaActual;
        totalPaginas = data.totalPaginas;

        renderizarProductos(todosProductos);
        renderizarPaginacion();
    } catch (err) {
        console.error("Error al cargar productos paginados:", err);
    }
}

/* ===============================
   Renderizar productos
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

                    <button
                        class="btn btn-primary mt-auto"
                        ${p.stock === 0 ? "disabled" : ""}
                        onclick="añadirAlCarrito(${p.id}, ${p.stock})">
                        ${p.stock === 0 ? "Sin stock" : "Añadir al carrito"}
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
   Renderizar paginación
================================ */
function renderizarPaginacion() {
    const contenedor = document.getElementById("paginacion");
    contenedor.innerHTML = "";

    const btnPrev = document.createElement("button");
    btnPrev.textContent = "« Anterior";
    btnPrev.className = "btn btn-secondary me-1";
    btnPrev.disabled = paginaActual === 0;
    btnPrev.onclick = () => cargarProductosPagina(paginaActual - 1);
    contenedor.appendChild(btnPrev);

    const btnNext = document.createElement("button");
    btnNext.textContent = "Siguiente »";
    btnNext.className = "btn btn-secondary";
    btnNext.disabled = paginaActual >= totalPaginas - 1;
    btnNext.onclick = () => cargarProductosPagina(paginaActual + 1);
    contenedor.appendChild(btnNext);
}

/* ===============================
   Editar producto
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

        document.getElementById("imagen").value = "";

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
   Crear / actualizar producto
================================ */
document.getElementById("btn-submit-producto").addEventListener("click", async () => {

    const categoriaId = document.getElementById("categoria").value;
    if (!categoriaId) {
        mostrarMensaje("Selecciona una categoría");
        return;
    }

    const formData = new FormData();
    formData.append("nombre", document.getElementById("nombre").value);
    formData.append("descripcion", document.getElementById("descripcion").value);
    formData.append("precio", document.getElementById("precio").value);
    formData.append("stock", document.getElementById("stock").value);
    formData.append("categoriaId", categoriaId);

    const inputImagen = document.getElementById("imagen");
    if (inputImagen && inputImagen.files.length > 0) {
        formData.append("imagen", inputImagen.files[0]);
    }

    const url = productoEditandoId
        ? `${API_PRODUCTOS}/${productoEditandoId}`
        : API_PRODUCTOS;
    const method = productoEditandoId ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            body: formData,
            credentials: "include"
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

        cargarProductosPagina(paginaActual);

    } catch (err) {
        console.error(err);
        mostrarMensaje("Error al guardar producto");
    }
});

/* ===============================
   Eliminar producto
================================ */
async function eliminarProducto(id) {
    mostrarConfirmacion("🗑 ¿Eliminar producto?", async () => {
        try {
            const res = await fetch(`${API_PRODUCTOS}/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                mostrarMensaje("❌ Error al eliminar producto");
                return;
            }

            mostrarMensaje("✅ Producto eliminado correctamente");
            cargarProductosPagina(paginaActual);

        } catch (err) {
            console.error(err);
            mostrarMensaje("❌ Error al eliminar producto");
        }
    });
}


/* ===============================
   Crear categoría
================================ */
const btnCrearCategoria = document.getElementById("btn-crear-categoria");
const formCrearCategoria = document.getElementById("form-crear-categoria");

if (usuario.rol === "admin") {
    btnCrearCategoria.style.display = "inline-block";
} else {
    btnCrearCategoria.style.display = "none";
}

btnCrearCategoria.addEventListener("click", () => {
    const formProducto = document.getElementById("form-crear-producto");
    const formCategoria = document.getElementById("form-crear-categoria");

    // Cerrar producto si está abierto
    formProducto.style.display = "none";

    // Toggle categoría
    formCategoria.style.display =
        formCategoria.style.display === "none" ? "block" : "none";
});


document.getElementById("btn-guardar-categoria").addEventListener("click", async () => {
    const nombre = document.getElementById("nombreCategoria").value.trim();

    if (!nombre) {
        mostrarMensaje("El nombre de la categoría es obligatorio");
        return;
    }

    try {
        const res = await fetch(API_CATEGORIAS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre })
        });

        if (!res.ok) {
            const msg = await res.text();
            mostrarMensaje("Error: " + msg);
            return;
        }

        mostrarMensaje("Categoría creada correctamente");

        document.getElementById("nombreCategoria").value = "";
        formCrearCategoria.style.display = "none";

        //Recargar categorías en selects
        cargarCategorias();
        cargarCategoriasFiltro();

    } catch (err) {
        console.error(err);
        mostrarMensaje("Error al crear categoría");
    }
});



/* ===============================
   Añadir al carrito
================================ */
async function añadirAlCarrito(id, stockDisponible) {
    if (!usuarioId) {
        mostrarMensaje("Debes iniciar sesión para añadir productos");
        return;
    }

    if (stockDisponible === 0) {
        mostrarMensaje("No hay stock disponible de este producto");
        return;
    }

    try {
        const res = await fetch(
            `${API_CARRITO}/${usuarioId}/agregar?productoId=${id}&cantidad=1`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        if (!res.ok) {
            if (res.status === 409) {
                const msg = await res.text();
                mostrarMensaje("❌ No hay stock");
                return;
            }

            mostrarMensaje("❌ Error al añadir el producto al carrito");
            return;
        }


        mostrarMensaje("Producto añadido al carrito");


    } catch (err) {
        console.error(err);
        mostrarMensaje("Error al añadir producto al carrito");
    }
}


/* ===============================
   Filtrar / ordenar
================================ */
document.getElementById("btn-aplicar-filtros").addEventListener("click", () => {
    filtros.categoriaId = document.getElementById("filtroCategoria").value;
    filtros.criterio = document.getElementById("criterioOrden").value;
    filtros.direccion = document.getElementById("ordenDireccion").value;

    cargarProductosPagina(0);
});

document.getElementById("btn-filtrar-precio").addEventListener("click", () => {
    filtros.precioMin = parseFloat(document.getElementById("precioMin").value) || 0;
    filtros.precioMax = parseFloat(document.getElementById("precioMax").value) || Infinity;

    cargarProductosPagina(0);
});


/* ===============================
   Menú y filtros móvil
================================ */

const btnMenuMovil = document.getElementById("btn-menu-movil");
const btnFiltrosMovil = document.getElementById("btn-filtros-movil");

if (btnMenuMovil) {
    btnMenuMovil.addEventListener("click", () => {
        document.body.classList.toggle("menu-abierto");
        document.body.classList.remove("filtros-abiertos");
    });
}

if (btnFiltrosMovil) {
    btnFiltrosMovil.addEventListener("click", () => {
        document.body.classList.toggle("filtros-abiertos");
        document.body.classList.remove("menu-abierto");
    });
}



/* ===============================
   Inicializar
================================ */
cargarCategorias();
cargarCategoriasFiltro();
cargarProductosPagina(0);
