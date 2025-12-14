package com.jardineria.service;

import com.jardineria.model.DetallePedido;
import com.jardineria.repository.DetallePedidoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DetallePedidoService {

    private final DetallePedidoRepository detallePedidoRepository;

    public DetallePedidoService(DetallePedidoRepository detallePedidoRepository) {
        this.detallePedidoRepository = detallePedidoRepository;
    }

    public List<DetallePedido> listar() {
        return detallePedidoRepository.findAll();
    }

    public Optional<DetallePedido> obtenerPorId(Long id) {
        return detallePedidoRepository.findById(id);
    }

    public DetallePedido guardar(DetallePedido detallePedido) {
        return detallePedidoRepository.save(detallePedido);
    }

    public void eliminar(Long id) {
        detallePedidoRepository.deleteById(id);
    }
}
