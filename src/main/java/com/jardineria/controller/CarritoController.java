package com.jardineria.controller;

import com.jardineria.model.Carrito;
import com.jardineria.service.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    //  Ver el carrito de un usuario
    @GetMapping("/{usuarioId}")
    public Carrito verCarrito(@PathVariable Long usuarioId) {
        return carritoService.obtenerCarrito(usuarioId);
    }

    //  Agregar un producto al carrito
    @PostMapping("/{usuarioId}/agregar")
    public Carrito agregarProducto(
            @PathVariable Long usuarioId,
            @RequestParam Long productoId,
            @RequestParam(defaultValue = "1") int cantidad
    ) {
        return carritoService.agregarProducto(usuarioId, productoId, cantidad);
    }

    //  Eliminar un producto del carrito
    @DeleteMapping("/{usuarioId}/eliminar/{itemId}")
    public Carrito eliminarItem(
            @PathVariable Long usuarioId,
            @PathVariable Long itemId
    ) {
        return carritoService.eliminarItem(usuarioId, itemId);
    }
}
