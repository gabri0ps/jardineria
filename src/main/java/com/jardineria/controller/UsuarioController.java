package com.jardineria.controller;

import com.jardineria.model.Usuario;
import com.jardineria.repository.UsuarioRepository;
import com.jardineria.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/jardineria/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/usuario/actual")
    public Usuario usuarioActual(Authentication authentication) {
        // authentication.getName() devuelve el email (o username) del usuario logueado
        return usuarioService.buscarPorEmail(authentication.name())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody Usuario usuario, BindingResult result) {

        if (result.hasErrors()) {
            String mensajeError = result.getFieldError().getDefaultMessage();
            return ResponseEntity.badRequest().body(mensajeError);
        }

        try {
            usuarioService.guardarUsuario(usuario);
            return ResponseEntity.ok("Usuario registrado con éxito ✅");

        } catch (DataIntegrityViolationException e) {
            // Email duplicado
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Ese email ya está registrado");
        }
    }


    @PutMapping("/perfil")
    public Usuario actualizarPerfil(@RequestBody Usuario datos) {
        // Buscar usuario por ID
        Usuario usuario = usuarioRepository.findById(datos.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar email duplicado
        usuarioRepository.findByEmail(datos.getEmail())
                .ifPresent(u -> {
                    if (!u.getId().equals(usuario.getId())) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "El email ya está en uso"
                        );
                    }
                });

        usuario.setNombre(datos.getNombre());
        usuario.setEmail(datos.getEmail());

        if (datos.getPassword() != null && !datos.getPassword().isEmpty()) {
            usuario.setPassword(datos.getPassword());
        }

        return usuarioRepository.save(usuario);
    }


}
