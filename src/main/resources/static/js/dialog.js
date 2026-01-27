function mostrarMensaje(texto) {
    const dialog = document.getElementById("dialogMensaje");
    const mensaje = document.getElementById("mensajeTexto");

    mensaje.textContent = texto;
    dialog.showModal();

    document.getElementById("cerrarMensaje").onclick = () => dialog.close();
}


function mostrarConfirmacion(texto, onConfirmar) {
    const dialog = document.getElementById("dialogMensaje");
    const mensaje = document.getElementById("mensajeTexto");
    const btnConfirmar = document.getElementById("btn-confirmar");
    const btnCerrar = document.getElementById("cerrarMensaje");

    mensaje.textContent = texto;
    btnConfirmar.classList.remove("d-none");

    const cerrar = () => {
        btnConfirmar.classList.add("d-none");
        btnConfirmar.onclick = null;
        dialog.close();
    };

    btnCerrar.onclick = cerrar;

    btnConfirmar.onclick = () => {
        cerrar();
        onConfirmar();
    };

    dialog.showModal();
}
