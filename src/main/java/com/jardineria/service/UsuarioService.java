package com.jardineria.service;

import com.jardineria.model.Usuario;
import com.jardineria.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Método requerido por Spring Security
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPassword())
                .roles(usuario.getRol().name().toUpperCase()) // Spring espera mayúsculas
                .build();
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario guardar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Usuario guardarUsuario(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }


    public Optional<Usuario> login(String email, String password) {
        return usuarioRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()));
    }

    public Usuario actualizarPerfil(Long id, Usuario datos) {
        Usuario usuarioBD = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // SOLO campos permitidos
        if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
            usuarioBD.setNombre(datos.getNombre());
        }

        if (datos.getEmail() != null && !datos.getEmail().isBlank()) {
            usuarioBD.setEmail(datos.getEmail());
        }

        if (datos.getPassword() != null && !datos.getPassword().isBlank()) {
            usuarioBD.setPassword(passwordEncoder.encode(datos.getPassword()));
        }

        // NO tocar rol, id, pedidos, etc.

        return usuarioRepository.save(usuarioBD);
    }


}
