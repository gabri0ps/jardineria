package com.jardineria.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "detalle_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer cantidad;

    private Double subtotal;

    // Relación con pedido
    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    // Relación con producto
    @ManyToOne
    @JoinColumn(name = "id_producto")
    private Producto producto;
}
