package com.consultorio.config;

import com.consultorio.model.Usuario;
import com.consultorio.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.initial-user.enabled", havingValue = "true")
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String initialUsername;
    private final String initialPassword;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.initial-user.username}") String initialUsername,
            @Value("${app.initial-user.password}") String initialPassword
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.initialUsername = initialUsername;
        this.initialPassword = initialPassword;
    }

    @Override
    public void run(String... args) {
        if (initialUsername.isBlank() || initialPassword.isBlank()) {
            throw new IllegalStateException(
                    "INITIAL_USER_USERNAME e INITIAL_USER_PASSWORD son obligatorias al habilitar el usuario inicial."
            );
        }
        if (usuarioRepository.findByUsername(initialUsername).isPresent()) {
            return;
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(initialUsername);
        usuario.setPassword(passwordEncoder.encode(initialPassword));
        usuario.setNombre("Profesional del consultorio");
        usuario.setActivo(true);

        usuarioRepository.save(usuario);
    }
}
