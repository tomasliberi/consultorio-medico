package com.consultorio.security;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration BLOCK_DURATION = Duration.ofMinutes(15);
    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Attempt attempt = attempts.get(key);
        if (attempt == null) return false;
        if (attempt.blockedUntil() != null && Instant.now().isBefore(attempt.blockedUntil())) return true;
        if (attempt.blockedUntil() != null) attempts.remove(key);
        return false;
    }

    public void failed(String key) {
        attempts.compute(key, (ignored, current) -> {
            int count = current == null ? 1 : current.count() + 1;
            Instant blockedUntil = count >= MAX_ATTEMPTS ? Instant.now().plus(BLOCK_DURATION) : null;
            return new Attempt(count, blockedUntil);
        });
    }

    public void succeeded(String key) {
        attempts.remove(key);
    }

    private record Attempt(int count, Instant blockedUntil) {}
}
