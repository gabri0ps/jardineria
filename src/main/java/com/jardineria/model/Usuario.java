package com.jardineria.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data // genera getters, setters, toString, equals, hashCode
@NoArgsConstructor // genera constructor vacío
@AllArgsConstructor // genera constructor con todos los campos
@Builder // permite crear objetos con patrón Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String apellido;
    private String email;
    private String password;
    private String rol; // ejemplo: "ADMIN" o "CLIENTE"
}
