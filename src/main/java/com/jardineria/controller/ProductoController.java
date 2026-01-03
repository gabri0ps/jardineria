package com.jardineria.controller;

import com.jardineria.model.Categoria;
import com.jardineria.model.Producto;
import com.jardineria.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public Producto obtenerProducto(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Producto crearProducto(
            @RequestParam String nombre,
            @RequestParam String descripcion,
            @RequestParam Double precio,
            @RequestParam Integer stock,
            @RequestParam Long categoriaId,
            @RequestParam(required = false) MultipartFile imagen
    ) {
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setCategoria(new Categoria(categoriaId, null, null));

        return productoService.guardar(producto, imagen);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Producto actualizarProducto(
            @PathVariable Long id,
            @RequestParam String nombre,
            @RequestParam String descripcion,
            @RequestParam Double precio,
            @RequestParam Integer stock,
            @RequestParam Long categoriaId,
            @RequestParam(required = false) MultipartFile imagen
    ) {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setCategoria(new Categoria(categoriaId, null, null));

        return productoService.guardar(producto, imagen);
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        productoService.eliminar(id);
    }

    @GetMapping("/pagina")
    public Map<String, Object> listarProductosPaginados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) Long categoriaId
    ) {
        Page<Producto> productosPage;

        if (categoriaId != null) {
            productosPage = productoService.listarPorCategoriaPaginado(categoriaId, page, size);
        } else {
            productosPage = productoService.listarPaginado(page, size);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("productos", productosPage.getContent());
        response.put("paginaActual", productosPage.getNumber());
        response.put("totalPaginas", productosPage.getTotalPages());
        response.put("totalElementos", productosPage.getTotalElements());

        return response;
    }




}
