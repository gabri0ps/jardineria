package com.jardineria.controller;

import com.jardineria.model.Carrito;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping("/{usuarioId}")
    public Carrito verCarrito(@PathVariable Long usuarioId) {
        return carritoService.obtenerCarrito(usuarioId);
    }

    @PostMapping("/{usuarioId}/agregar")
    public Carrito agregarProducto(
            @PathVariable Long usuarioId,
            @RequestParam Long productoId,
            @RequestParam int cantidad
    ) {
        return carritoService.agregarProducto(usuarioId, productoId, cantidad);
    }

    @DeleteMapping("/{usuarioId}/eliminar/{itemId}")
    public Carrito eliminarItem(
            @PathVariable Long usuarioId,
            @PathVariable Long itemId
    ) {
        return carritoService.eliminarItem(usuarioId, itemId);
    }
}

