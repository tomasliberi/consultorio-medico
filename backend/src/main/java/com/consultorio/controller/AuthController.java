package com.consultorio.controller;

import com.consultorio.model.Usuario;
import com.consultorio.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/auth")
public class AuthController {
    private final AuthenticationManager manager; private final SecurityContextRepository contexts;
    private final UsuarioRepository users; private final PasswordEncoder encoder;
    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();
    public AuthController(AuthenticationManager manager, SecurityContextRepository contexts, UsuarioRepository users, PasswordEncoder encoder) {
        this.manager=manager; this.contexts=contexts; this.users=users; this.encoder=encoder;
    }
    @GetMapping("/csrf") public CsrfResponse csrf(CsrfToken token) { return new CsrfResponse(token.getToken()); }
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest body, HttpServletRequest req, HttpServletResponse res) {
        String key=req.getRemoteAddr()+":"+body.username(); Attempt old=attempts.get(key);
        if(old!=null && old.count()>=5 && old.until().isAfter(Instant.now())) throw new IllegalArgumentException("Demasiados intentos. Esperá 15 minutos.");
        try {
            var auth=manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(body.username(),body.password()));
            var context=SecurityContextHolder.createEmptyContext(); context.setAuthentication(auth); SecurityContextHolder.setContext(context);
            contexts.saveContext(context,req,res); attempts.remove(key); return new AuthResponse(auth.getName());
        } catch(RuntimeException e) { attempts.compute(key,(k,v)->new Attempt(v==null?1:v.count()+1,Instant.now().plusSeconds(900))); throw e; }
    }
    @GetMapping("/me") public AuthResponse me(Principal principal) { return new AuthResponse(principal.getName()); }
    @PostMapping("/change-password") public void change(@Valid @RequestBody PasswordRequest body, Principal principal) {
        Usuario user=users.findByUsername(principal.getName()).orElseThrow();
        if(!encoder.matches(body.currentPassword(),user.getPassword())) throw new IllegalArgumentException("La contraseña actual es incorrecta.");
        user.setPassword(encoder.encode(body.newPassword())); users.save(user);
    }
    public record LoginRequest(@NotBlank String username,@NotBlank String password) {}
    public record PasswordRequest(@NotBlank String currentPassword,@Size(min=12,message="Debe tener al menos 12 caracteres.") String newPassword) {}
    public record AuthResponse(String username) {} public record CsrfResponse(String token) {} private record Attempt(int count,Instant until) {}
}
