const API_CARRITO = "http://localhost:8080/carrito";

// Obtener usuario del localStorage
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    alert("Debes iniciar sesión para acceder al carrito");
    window.location.href = "login.html";
    throw new Error("No hay usuario logueado");
}
const usuarioId = usuario.id;

// ---- Botón cerrar sesión ----
const btnCerrarSesion = document.createElement("button");
btnCerrarSesion.textContent = "Cerrar sesión";
btnCerrarSesion.className = "btn btn-warning ms-2";
btnCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    alert("Sesión cerrada");
    window.location.href = "login.html";
});
document.querySelector(".d-flex").appendChild(btnCerrarSesion);

// ---- Botón finalizar compra ----
document.getElementById("btn-comprar").addEventListener("click", async () => {
    try {
        const res = await fetch(`http://localhost:8080/pedido/finalizar/${usuarioId}`, {
            method: "POST"
        });

        if (res.ok) {
            alert("Compra realizada con éxito!");
            cargarCarrito(); // refresca el carrito vacío
        } else {
            const msg = await res.text();
            alert("Error al finalizar compra: " + msg);
        }
    } catch (err) {
        console.error(err);
        alert("Error en la conexión con el servidor");
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

    carrito.items.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.producto.nombre}</td>
            <td>${item.cantidad}</td>
            <td>${item.producto.precio.toFixed(2)} €</td>
            <td>${(item.producto.precio * item.cantidad).toFixed(2)} €</td>
            <td>
                <button onclick="eliminarItem(${item.id})" class="btn btn-danger btn-sm">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("total").textContent = carrito.total.toFixed(2) + " €";
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

// ---- Inicializar ----
cargarCarrito();
