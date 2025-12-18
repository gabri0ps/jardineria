package com.jardineria.service;

import com.jardineria.model.Carrito;
import com.jardineria.model.CarritoItem;
import com.jardineria.model.DetallePedido;
import com.jardineria.model.Pedido;
import com.jardineria.repository.CarritoRepository;
import com.jardineria.repository.PedidoRepository;
import com.jardineria.repository.ProductoRepository;
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
    private final ProductoRepository productoRepository;

    @Transactional
    public Pedido finalizarPedido(Long usuarioId) {

        // 1️⃣ Obtener carrito
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        if (carrito.getItems() == null || carrito.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // 2️⃣ Restar stock (ANTES de crear el pedido)
        carrito.getItems().forEach(item -> {
            var producto = item.getProducto();

            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException(
                        "Stock insuficiente para " + producto.getNombre()
                );
            }

            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);
        });

        // 3️⃣ Crear pedido
        Pedido pedido = Pedido.builder()
                .usuario(carrito.getUsuario())
                .total(carrito.getTotal())
                .estado(Pedido.EstadoPedido.pendiente) // 👈 CORRECTO
                .build();

        // 4️⃣ Crear detalles del pedido
        List<DetallePedido> detalles = carrito.getItems().stream()
                .map(item -> DetallePedido.builder()
                        .producto(item.getProducto())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getProducto().getPrecio())
                        .pedido(pedido)
                        .build())
                .toList();

        pedido.setItems(detalles);

        // 5️⃣ Guardar pedido
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // 6️⃣ Vaciar carrito
        carrito.getItems().clear();
        carrito.setTotal(0.0);
        carritoRepository.save(carrito);

        return pedidoGuardado;
    }

    public List<Pedido> obtenerPedidosPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId);
    }
}

