package com.jardineria.controller;

import com.jardineria.model.Pedido;
import com.jardineria.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedido")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping("/finalizar/{usuarioId}")
    public Pedido finalizarPedido(@PathVariable Long usuarioId) {
        return pedidoService.finalizarPedido(usuarioId);
    }


    @GetMapping("/usuario/{usuarioId}")
    public List<Pedido> obtenerPedidosUsuario(@PathVariable Long usuarioId) {
        return pedidoService.obtenerPedidosPorUsuario(usuarioId);
    }
}
