package com.jardineria.controller;

import com.jardineria.model.Usuario;
import com.jardineria.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody Usuario usuario, BindingResult result) {
        if (result.hasErrors()) {
            // Devolver primer mensaje de error
            String mensajeError = result.getFieldError().getDefaultMessage();
            return ResponseEntity.badRequest().body(mensajeError);
        }

        usuarioService.guardarUsuario(usuario); // Lógica para guardar en BD
        return ResponseEntity.ok("Usuario registrado con éxito ✅");
    }
}
