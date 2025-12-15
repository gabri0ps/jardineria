const API_PEDIDOS = "http://localhost:8080/pedido";

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    alert("Debes iniciar sesión");
    window.location.href = "login.html";
}

async function cargarPedidos() {
    const res = await fetch(`${API_PEDIDOS}/usuario/${usuario.id}`);
    const pedidos = await res.json();

    const contenedor = document.getElementById("pedidos");
    contenedor.innerHTML = "";

    if (!pedidos.length) {
        contenedor.innerHTML = "<p>No tienes pedidos aún.</p>";
        return;
    }

    pedidos.forEach(p => {
        let html = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5>Pedido #${p.id}</h5>
                    <p>Fecha: ${new Date(p.fecha).toLocaleString()}</p>
                    <p>Estado: ${p.estado}</p>
                    <p class="fw-bold">Total: ${p.total.toFixed(2)} €</p>
                    <ul class="list-group mt-2">
        `;

        p.items.forEach(item => {
            html += `
                <li class="list-group-item">
                    ${item.producto.nombre} — ${item.cantidad} x ${item.precioUnitario.toFixed(2)} €
                </li>
            `;
        });

        html += `</ul></div></div>`;
        contenedor.innerHTML += html;
    });
}

cargarPedidos();
