package com.jardineria.service;

import com.jardineria.model.Carrito;
import com.jardineria.model.CarritoItem;
import com.jardineria.model.Producto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final ProductoRepository productoRepository;

    public Carrito obtenerCarrito(Long usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrito carrito = Carrito.builder()
                            .usuario(Usuario.builder().id(usuarioId).build())
                            .total(0)
                            .build();
                    return carritoRepository.save(carrito);
                });
    }

    public Carrito agregarProducto(Long usuarioId, Long productoId, int cantidad) {
        Carrito carrito = obtenerCarrito(usuarioId);
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Buscar si ya existe ese producto en el carrito
        Optional<CarritoItem> existente = carrito.getItems().stream()
                .filter(i -> i.getProducto().getId().equals(productoId))
                .findFirst();

        if (existente.isPresent()) {
            CarritoItem item = existente.get();
            item.setCantidad(item.getCantidad() + cantidad);
            carritoItemRepository.save(item);
        } else {
            CarritoItem nuevo = CarritoItem.builder()
                    .producto(producto)
                    .cantidad(cantidad)
                    .carrito(carrito)
                    .build();
            carritoItemRepository.save(nuevo);
            carrito.getItems().add(nuevo);
        }

        recalcularTotal(carrito);
        return carritoRepository.save(carrito);
    }

    public Carrito eliminarItem(Long usuarioId, Long itemId) {
        Carrito carrito = obtenerCarrito(usuarioId);

        carrito.getItems().removeIf(item -> item.getId().equals(itemId));
        carritoItemRepository.deleteById(itemId);

        recalcularTotal(carrito);
        return carritoRepository.save(carrito);
    }

    private void recalcularTotal(Carrito carrito) {
        double total = carrito.getItems().stream()
                .mapToDouble(i -> i.getProducto().getPrecio() * i.getCantidad())
                .sum();
        carrito.setTotal(total);
    }
}

