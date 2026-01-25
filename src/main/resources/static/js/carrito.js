const API_CARRITO = "http://localhost:8080/carrito";

// Obtener usuario del localStorage
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    mostrarMensaje("Debes iniciar sesión para acceder al carrito");
    window.location.href = "login.html";
    throw new Error("No hay usuario logueado");
}
const usuarioId = usuario.id;

// ---- Botón cerrar sesión ----
const btnCerrarSesion = document.createElement("button");
btnCerrarSesion.textContent = "Cerrar sesión";
btnCerrarSesion.className = "btn btn-warning";
btnCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    mostrarMensaje("Sesión cerrada");
    window.location.href = "login.html";
});

document.getElementById("btn-volver-catalogo").addEventListener("click", () => {
    window.location.href = "catalogo.html";
});

document.getElementById("btn-perfil").addEventListener("click", () => {
    window.location.href = "perfil.html";
});


document.getElementById("contenedor-cerrar-sesion")
        .appendChild(btnCerrarSesion);


// ---- Botón finalizar compra ----
document.getElementById("btn-comprar").addEventListener("click", async () => {
    try {
        const res = await fetch(`http://localhost:8080/pedido/finalizar/${usuarioId}`, {
            method: "POST"
        });

        if (res.ok) {
            mostrarMensaje("Compra realizada con éxito!");
            cargarCarrito(); // refresca el carrito vacío
        } else {
            const msg = await res.text();
            mostrarMensaje("Error al finalizar compra: " + msg);
        }
    } catch (err) {
        console.error(err);
        mostrarMensaje("Error en la conexión con el servidor");
    }
});

// ---- Cargar carrito ----
async function cargarCarrito() {
    try {
        const res = await fetch(`http://localhost:8080/carrito/${usuarioId}`);
        const carrito = await res.json();
        renderCarrito(carrito);
    } catch (err) {
        console.error("Error cargando carrito:", err);
    }
}

// ---- Renderizar carrito ----
function renderCarrito(carrito) {
    const tbody = document.getElementById("carrito-body");
    tbody.innerHTML = "";

    if (!carrito.items || carrito.items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No hay productos en el carrito</td></tr>`;
        document.getElementById("total").textContent = "0.00 €";
        return;
    }

    let total = 0;

    carrito.items.forEach(item => {
        const tr = document.createElement("tr");

        const subtotal = item.producto.precio * item.cantidad;
        total += subtotal;

        tr.innerHTML = `
        <td>${item.producto.nombre}</td>

        <td>
           <input
               type="number"
               min="1"
               max="${item.producto.stock}"
               value="${item.cantidad}"
               class="form-control form-control-sm text-center cantidad-input"
               style="width: 80px;"
           >

        </td>

        <td>${item.producto.precio.toFixed(2)} €</td>

        <td class="subtotal">
            ${subtotal.toFixed(2)} €
        </td>

        <td>
            <button onclick="eliminarItem(${item.id})" class="btn btn-danger btn-sm">❌</button>
        </td>
        `;

        const inputCantidad = tr.querySelector(".cantidad-input");
        const tdSubtotal = tr.querySelector(".subtotal");

        inputCantidad.addEventListener("change", async () => {
            let nuevaCantidad = parseInt(inputCantidad.value);

            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                nuevaCantidad = 1;
            }

            if (nuevaCantidad > item.producto.stock) {
                nuevaCantidad = item.producto.stock;
                mostrarMensaje(`Solo hay ${item.producto.stock} unidades disponibles`);
            }

            inputCantidad.value = nuevaCantidad;

            try {
                const res = await fetch(
                    `${API_CARRITO}/${usuarioId}/actualizar/${item.id}?cantidad=${nuevaCantidad}`,
                    { method: "PUT" }
                );

                if (!res.ok) {
                    mostrarMensaje("Error al actualizar cantidad");
                    return;
                }

                const carritoActualizado = await res.json();
                renderCarrito(carritoActualizado);

            } catch (err) {
                console.error(err);
                mostrarMensaje("Error de conexión");
            }
        });

        tbody.appendChild(tr);
    });
    document.getElementById("total").textContent = total.toFixed(2) + " €";
}


// ---- Eliminar item ----
async function eliminarItem(itemId) {
    try {
        const res = await fetch(`http://localhost:8080/carrito/${usuarioId}/eliminar/${itemId}`, { method: "DELETE" });
        const carrito = await res.json();
        renderCarrito(carrito);
    } catch (err) {
        console.error("Error eliminando item:", err);
    }
}

/* ===============================
   Menú móvil carrito
================================ */
const btnMenuCarrito = document.getElementById("btn-menu-carrito");

if (btnMenuCarrito) {
    btnMenuCarrito.addEventListener("click", () => {
        document.body.classList.toggle("menu-abierto");
    });
}


// ---- Inicializar ----
cargarCarrito();