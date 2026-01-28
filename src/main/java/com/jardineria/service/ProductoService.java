package com.jardineria.service;

import com.jardineria.model.Producto;
import com.jardineria.repository.CategoriaRepository;
import com.jardineria.repository.ProductoRepository;
import org.springframework.data.domain.*;
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
    private static final String IMG_DIR = System.getProperty("user.dir") + "/uploads/";



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

        producto.setCategoria(
                categoriaRepository.findById(producto.getCategoria().getId())
                        .orElseThrow(() -> new RuntimeException("Categoría no válida"))
        );

        // Solo cambiar imagen si se sube una nueva
        if (imagen != null && !imagen.isEmpty()) {

            // borrar imagen antigua si existe
            if (producto.getImagen() != null) {
                borrarImagen(producto.getImagen());
            }

            producto.setImagen(guardarImagen(imagen));
        }


        // NO tocar la imagen si ya existe
        return productoRepository.save(producto);
    }

    private void borrarImagen(String rutaImagen) {
        try {
            String nombreArchivo = rutaImagen.replace("/img/", "");

            // solo borrar si es imagen subida (UUID_)
            if (!nombreArchivo.contains("-")) {
                return;
            }

            Path ruta = Paths.get(IMG_DIR + nombreArchivo);
            Files.deleteIfExists(ruta);

        } catch (IOException e) {
            throw new RuntimeException("Error al borrar imagen", e);
        }
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

    public Page<Producto> listarConFiltros(
            Long categoriaId,
            Double precioMin,
            Double precioMax,
            String sort,
            String dir,
            int page,
            int size
    ) {
        Sort orden = Sort.unsorted();
        if (sort != null && dir != null) {
            orden = dir.equalsIgnoreCase("asc")
                    ? Sort.by(sort).ascending()
                    : Sort.by(sort).descending();
        }

        Pageable pageable = PageRequest.of(page, size, orden);

        precioMin = precioMin != null ? precioMin : 0;
        precioMax = precioMax != null ? precioMax : Double.MAX_VALUE;

        if (categoriaId != null) {
            return productoRepository.findByCategoriaIdAndPrecioBetween(
                    categoriaId, precioMin, precioMax, pageable
            );
        }

        return productoRepository.findByPrecioBetween(
                precioMin, precioMax, pageable
        );
    }


    public void eliminar(Long id) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // borrar imagen asociada
        if (producto.getImagen() != null) {
            borrarImagen(producto.getImagen());
        }

        productoRepository.delete(producto);
    }

}
