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
    public Map<String, Object> listarPaginado(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String dir
    ) {
        Page<Producto> pagina = productoService.listarConFiltros(
                categoriaId, precioMin, precioMax, sort, dir, page, size
        );

        Map<String, Object> res = new HashMap<>();
        res.put("productos", pagina.getContent());
        res.put("paginaActual", pagina.getNumber());
        res.put("totalPaginas", pagina.getTotalPages());
        res.put("totalElementos", pagina.getTotalElements());

        return res;
    }





}
