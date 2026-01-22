package com.jardineria.service;

import com.jardineria.model.Carrito;
import com.jardineria.model.CarritoItem;
import com.jardineria.model.Producto;
import com.jardineria.model.Usuario;
import com.jardineria.repository.CarritoRepository;
import com.jardineria.repository.ProductoRepository;
import com.jardineria.repository.CarritoItemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final ProductoRepository productoRepository;

    public Carrito obtenerCarrito(Long usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId)
                .map(carrito -> {
                    if (carrito.getItems() == null) {
                        carrito.setItems(new ArrayList<>());
                    }
                    return carrito;
                })
                .orElseGet(() -> {
                    Carrito carrito = Carrito.builder()
                            .usuario(Usuario.builder().id(usuarioId).build())
                            .total(0)
                            .items(new ArrayList<>())
                            .build();
                    return carritoRepository.save(carrito);
                });
    }



    public Carrito agregarProducto(Long usuarioId, Long productoId, int cantidad) {
        Carrito carrito = obtenerCarrito(usuarioId);

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getStock() == 0) {
            throw new RuntimeException("Producto sin stock");
        }

        if (cantidad > producto.getStock()) {
            throw new RuntimeException("No hay stock suficiente");
        }

        Optional<CarritoItem> existente = carrito.getItems().stream()
                .filter(i -> i.getProducto().getId().equals(productoId))
                .findFirst();

        if (existente.isPresent()) {
            CarritoItem item = existente.get();
            int nuevaCantidad = item.getCantidad() + cantidad;

            if (nuevaCantidad > producto.getStock()) {
                throw new RuntimeException("No hay stock suficiente");
            }

            item.setCantidad(nuevaCantidad);
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

    // Vaciar el carrito de un usuario
    @Transactional
    public void vaciarCarrito(Long usuarioId) {
        // Obtener carrito del usuario
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        // Eliminar todos los items del carrito
        carritoItemRepository.deleteAll(carrito.getItems());

        // Actualizar total del carrito a 0
        carrito.setTotal(0.0);
        carritoRepository.save(carrito);
    }

    @Transactional
    public Carrito actualizarCantidad(Long usuarioId, Long itemId, int cantidad) {

        if (cantidad < 1) {
            throw new RuntimeException("Cantidad inválida");
        }

        Carrito carrito = obtenerCarrito(usuarioId);

        CarritoItem item = carrito.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        Producto producto = item.getProducto();

        if (cantidad > producto.getStock()) {
            throw new RuntimeException("No hay stock suficiente");
        }

        item.setCantidad(cantidad);
        carritoItemRepository.save(item);

        recalcularTotal(carrito);
        return carritoRepository.save(carrito);
    }


}

