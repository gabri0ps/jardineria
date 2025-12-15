function mostrarMensaje(texto) {
    const dialog = document.getElementById("dialogMensaje");
    const mensaje = document.getElementById("mensajeTexto");

    mensaje.textContent = texto;
    dialog.showModal();

    document.getElementById("cerrarMensaje").onclick = () => dialog.close();
}
