package com.jardineria.repository;

import com.jardineria.model.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Page<Producto> findByCategoriaId(Long categoriaId, Pageable pageable);

    List<Producto> findAllByCategoriaId(Long categoriaId);

    Page<Producto> findByPrecioBetween(
            Double min, Double max, Pageable pageable
    );

    Page<Producto> findByCategoriaIdAndPrecioBetween(
            Long categoriaId, Double min, Double max, Pageable pageable
    );
}

