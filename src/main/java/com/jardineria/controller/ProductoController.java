package com.jardineria.controller;

import com.jardineria.model.Producto;
import com.jardineria.model.Usuario;
import com.jardineria.service.ProductoService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/jardineria/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public List<Producto> listarProductos() {
        return productoService.listar();
    }

    @GetMapping("/{id}")
    public Optional<Producto> obtenerProducto(@PathVariable Long id) {
        return productoService.obtenerPorId(id);
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<Producto> listarPorCategoria(@PathVariable Long categoriaId) {
        return productoService.listarPorCategoria(categoriaId);
    }

    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto, HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null || !usuario.getRol().equals(Usuario.Rol.admin)) {
            throw new RuntimeException("No tienes permiso para crear productos");
        }
        return productoService.guardar(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        producto.setId(id);
        return productoService.guardar(producto);
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        productoService.eliminar(id);
    }
}
