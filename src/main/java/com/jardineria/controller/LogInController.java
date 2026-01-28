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

        //Comprobamos credenciales (BCrypt)
        var usuarioOpt = usuarioService.login(userReq.getEmail(), userReq.getPassword());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }

        Usuario usuario = usuarioOpt.get();

        //Creamos autenticación
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        usuario.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority(
                                "ROLE_" + usuario.getRol().name().toUpperCase()
                        ))
                );

        SecurityContextHolder.getContext().setAuthentication(authToken);

        session.setAttribute(
                "SPRING_SECURITY_CONTEXT",
                SecurityContextHolder.getContext()
        );

        //Guardamos usuario para el frontend
        session.setAttribute("usuario", usuario);

        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Sesión cerrada");
    }
}
