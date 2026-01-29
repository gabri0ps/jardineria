package com.jardineria.service;

import com.jardineria.model.Categoria;
import com.jardineria.repository.CategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> obtenerPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    public Categoria guardar(Categoria categoria) {

        if (categoriaRepository.existsByNombreIgnoreCase(categoria.getNombre())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La categoría ya existe"
            );
        }

        return categoriaRepository.save(categoria);
    }


    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Categoría no encontrada"));

        if (!categoria.getProductos().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar una categoría con productos asociados"
            );
        }

        categoriaRepository.delete(categoria);
    }


}
