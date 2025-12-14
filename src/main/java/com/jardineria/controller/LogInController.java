package com.jardineria.controller;

import com.jardineria.model.Usuario;
import com.jardineria.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jardineria/auth")
@CrossOrigin("*")
public class LogInController {

    private final UsuarioService usuarioService;

    public LogInController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario userReq, HttpSession session) {

        // Comprobamos credenciales manualmente
        var usuario = usuarioService.login(userReq.getEmail(), userReq.getPassword());
        if (usuario.isEmpty()) {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }

        // Creamos autenticación para Spring Security
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        usuario.get().getEmail(),
                        usuario.get().getPassword(),
                        List.of(new SimpleGrantedAuthority("ROLE_" + usuario.get().getRol().name().toUpperCase()))
                );

        // Subimos al contexto de seguridad
        SecurityContextHolder.getContext().setAuthentication(authToken);

        // Aseguramos que Spring use la misma sesión
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        session.setAttribute("usuario", usuario.get());

        return ResponseEntity.ok(usuario.get());
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Sesión cerrada");
    }
}
