package com.jardineria.repository;

import com.jardineria.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    // Aquí puedes añadir métodos personalizados si quieres buscar pedidos por usuario, estado, etc.
}
