package com.consultorio.config;

import com.consultorio.model.Usuario;
import com.consultorio.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String initialUsername;
    private final String initialPassword;
    private final boolean production;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.initial-user.username}") String initialUsername,
            @Value("${app.initial-user.password}") String initialPassword,
            @Value("${app.production:false}") boolean production
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.initialUsername = initialUsername;
        this.initialPassword = initialPassword;
        this.production = production;
    }

    @Override
    public void run(String... args) {
        if (production && (initialPassword.length() < 12 || "admin123".equals(initialPassword))) {
            throw new IllegalStateException("INITIAL_USER_PASSWORD debe tener al menos 12 caracteres en producción.");
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
