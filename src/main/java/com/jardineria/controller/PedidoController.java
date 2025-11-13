package com.jardineria.controller;

import com.jardineria.model.Pedido;
import com.jardineria.model.Usuario;
import com.jardineria.service.PedidoService;
import com.jardineria.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    private final UsuarioService usuarioService;

    public PedidoController(PedidoService pedidoService, UsuarioService usuarioService) {
        this.pedidoService = pedidoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public String listarPedidos(Model model) {
        model.addAttribute("pedidos", pedidoService.listar());
        return "pedidos/listar";
    }

    @GetMapping("/nuevo")
    public String crearPedidoForm(Model model) {
        model.addAttribute("pedido", new Pedido());
        model.addAttribute("usuarios", usuarioService.listar());
        return "pedidos/form";
    }

    @PostMapping("/guardar")
    public String guardarPedido(@ModelAttribute Pedido pedido) {
        pedidoService.guardar(pedido);
        return "redirect:/pedidos";
    }

    @GetMapping("/editar/{id}")
    public String editarPedidoForm(@PathVariable Long id, Model model) {
        Pedido pedido = pedidoService.obtenerPorId(id).orElseThrow();
        model.addAttribute("pedido", pedido);
        model.addAttribute("usuarios", usuarioService.listar());
        return "pedidos/form";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminarPedido(@PathVariable Long id) {
        pedidoService.eliminar(id);
        return "redirect:/pedidos";
    }
}
