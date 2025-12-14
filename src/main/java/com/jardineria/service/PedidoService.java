package com.jardineria.service;

import com.jardineria.model.Carrito;
import com.jardineria.model.CarritoItem;
import com.jardineria.model.DetallePedido;
import com.jardineria.model.Pedido;
import com.jardineria.repository.CarritoRepository;
import com.jardineria.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final CarritoRepository carritoRepository;

    @Transactional
    public Pedido finalizarPedido(Long usuarioId) {
        // Obtener el carrito del usuario
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        if (carrito.getItems() == null || carrito.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // Crear pedido
        Pedido pedido = Pedido.builder()
                .usuario(carrito.getUsuario())
                .total(carrito.getTotal())
                .estado(Pedido.EstadoPedido.PENDIENTE)
                .build();

        // Convertir items del carrito en items del pedido
        List<DetallePedido> detalles = carrito.getItems().stream().map(item -> {
            return DetallePedido.builder()
                    .producto(item.getProducto())
                    .cantidad(item.getCantidad())
                    .precioUnitario(item.getProducto().getPrecio())
                    .pedido(pedido)
                    .build();
        }).collect(Collectors.toList());

        pedido.setItems(detalles);

        // Guardar pedido
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // Vaciar carrito
        carrito.getItems().clear();
        carrito.setTotal(0.0);
        carritoRepository.save(carrito);

        return pedidoGuardado;
    }
}
