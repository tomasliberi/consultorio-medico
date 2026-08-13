package com.consultorio.controller;

import java.security.Principal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/login")
    public AuthResponse login(Principal principal) {
        return new AuthResponse(principal.getName());
    }

    public record AuthResponse(String username) {
    }
}
