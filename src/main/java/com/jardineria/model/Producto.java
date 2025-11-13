package com.jardineria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Double precio;
    private String imagen;

    // Relación con categoria
    @ManyToOne
    @JoinColumn(name = "categoria_id") // crea la columna categoria_id en la tabla producto
    private Categoria categoria;
}
