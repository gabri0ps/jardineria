package com.jardineria.controller;

import com.jardineria.model.Usuario;
import com.jardineria.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jardineria/auth")
@CrossOrigin("*")
public class LogInController {

    private final UsuarioService usuarioService;

    // Constructor único
    public LogInController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Endpoint de login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario userReq) {
        var usuario = usuarioService.login(userReq.getEmail(), userReq.getPassword());
        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get());
        } else {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }
    }
}
