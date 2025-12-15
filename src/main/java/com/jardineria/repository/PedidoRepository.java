package com.jardineria.repository;

import com.jardineria.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    // Devuelve todos los pedidos de un usuario específico
    List<Pedido> findByUsuarioId(Long usuarioId);
}
