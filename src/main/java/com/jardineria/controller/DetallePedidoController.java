package com.jardineria.controller;

import com.jardineria.model.DetallePedido;
import com.jardineria.service.DetallePedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/jardineria/detalle-pedidos")
@RequiredArgsConstructor
public class DetallePedidoController {

    private final DetallePedidoService detallePedidoService;

    @GetMapping
    public List<DetallePedido> listarDetallePedidos() {
        return detallePedidoService.listar();
    }

    @GetMapping("/{id}")
    public Optional<DetallePedido> obtenerDetallePedido(@PathVariable Long id) {
        return detallePedidoService.obtenerPorId(id);
    }

    @PostMapping
    public DetallePedido crearDetallePedido(@RequestBody DetallePedido detallePedido) {
        return detallePedidoService.guardar(detallePedido);
    }

    @PutMapping("/{id}")
    public DetallePedido actualizarDetallePedido(@PathVariable Long id, @RequestBody DetallePedido detallePedido) {
        detallePedido.setId(id);
        return detallePedidoService.guardar(detallePedido);
    }

    @DeleteMapping("/{id}")
    public void eliminarDetallePedido(@PathVariable Long id) {
        detallePedidoService.eliminar(id);
    }
}
