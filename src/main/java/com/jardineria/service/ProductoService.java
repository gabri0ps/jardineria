package com.jardineria.service;

import com.jardineria.model.Producto;
import com.jardineria.repository.CategoriaRepository;
import com.jardineria.repository.ProductoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    // Carpeta donde se guardarán las imágenes
    private static final String IMG_DIR = "uploads/";


    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Producto> listar() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    public List<Producto> listarPorCategoria(Long categoriaId) {
        return productoRepository.findAllByCategoriaId(categoriaId);
    }

    // Guardar producto con imagen opcional
    public Producto guardar(Producto producto, MultipartFile imagen) {
        // Validar categoría
        producto.setCategoria(
                categoriaRepository.findById(producto.getCategoria().getId())
                        .orElseThrow(() -> new RuntimeException("Categoría no válida"))
        );

        // Mantener imagen existente si no se sube una nueva
        if (imagen != null && !imagen.isEmpty()) {
            producto.setImagen(guardarImagen(imagen));
        } else if (producto.getImagen() == null || producto.getImagen().isEmpty()) {
            // Si no hay imagen y tampoco hay imagen existente, usar default
            producto.setImagen("/img/default.png");
        }

        return productoRepository.save(producto);
    }


    private String guardarImagen(MultipartFile imagen) {
        try {
            String nombreArchivo = UUID.randomUUID() + "_" + imagen.getOriginalFilename();
            Path ruta = Paths.get(IMG_DIR + nombreArchivo);
            Files.copy(imagen.getInputStream(), ruta, StandardCopyOption.REPLACE_EXISTING);
            return "/img/" + nombreArchivo;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen", e);
        }
    }

    public Page<Producto> listarPaginado(int pagina, int tamaño) {
        Pageable pageable = PageRequest.of(pagina, tamaño);
        return productoRepository.findAll(pageable);
    }

    public Page<Producto> listarPorCategoriaPaginado(Long categoriaId, int pagina, int tamaño) {
        Pageable pageable = PageRequest.of(pagina, tamaño);
        return productoRepository.findByCategoriaId(categoriaId, pageable);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}
