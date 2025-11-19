const API_CARRITO = "http://localhost:8080/carrito"; // Ajustado al controller actual

// Obtener usuario del localStorage
const usuario = JSON.parse(localStorage.getItem("usuario"));
let usuarioId = usuario ? usuario.id : null;

// Botón finalizar compra
document.getElementById("btn-comprar").addEventListener("click", async () => {
    if (!usuarioId) {
        alert("Debes iniciar sesión para comprar");
        return;
    }

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

// Función para cargar carrito
async function cargarCarrito() {
    if (!usuarioId) return;

    try {
        const res = await fetch(`http://localhost:8080/carrito/${usuarioId}`);
        const carrito = await res.json();
        renderCarrito(carrito);
    } catch (err) {
        console.error("Error cargando carrito:", err);
    }
}

// Renderizar carrito en HTML
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
                <button onclick="eliminarItem(${item.id})" class="btn-eliminar">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("total").textContent = carrito.total.toFixed(2) + " €";
}

// Eliminar item del carrito
async function eliminarItem(itemId) {
    if (!usuarioId) return;

    try {
        const res = await fetch(`http://localhost:8080/carrito/${usuarioId}/eliminar/${itemId}`, { method: "DELETE" });
        const carrito = await res.json();
        renderCarrito(carrito);
    } catch (err) {
        console.error("Error eliminando item:", err);
    }
}

// Cargar carrito al iniciar
cargarCarrito();
