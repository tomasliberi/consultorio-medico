package com.consultorio.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class LoginAttemptServiceTest {
    @Test
    void bloqueaLuegoDeCincoIntentosYPermiteLimpiarAlAutenticar() {
        LoginAttemptService service = new LoginAttemptService();
        String key = "127.0.0.1:usuario";

        for (int i = 0; i < 5; i++) service.failed(key);
        assertTrue(service.isBlocked(key));

        service.succeeded(key);
        assertFalse(service.isBlocked(key));
    }
}
