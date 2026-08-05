package com.project.aicrm.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    @Value("${jwt.secret:}")
    private String configuredSecret;

    private static final long EXPIRATION = 86400000; // 24 hours

    // Used only when JWT_SECRET is not provided. Clearly insecure — meant for local dev only.
    // Spring picks this up when running on localhost with no env var set.
    private static final String DEV_FALLBACK_SECRET =
        "dev-only-insecure-secret-do-not-use-in-production-32bytes!!";

    private SecretKey key;

    @PostConstruct
    void init() {
        String secret = configuredSecret;
        if (secret == null || secret.isBlank()) {
            secret = DEV_FALLBACK_SECRET;
            System.err.println(
                "[WARN] JWT_SECRET not set — using insecure development fallback. " +
                "DO NOT USE THIS IN PRODUCTION. Set JWT_SECRET (>=32 bytes) in your environment."
            );
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET must be at least 32 bytes for HS256. " +
                "Current length: " + secret.getBytes(StandardCharsets.UTF_8).length + " bytes."
            );
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, Long userId, String role, Long tenantId) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .claim("tenantId", tenantId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return parseClaims(token).get("userId", Long.class);
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public Long extractTenantId(String token) {
        return parseClaims(token).get("tenantId", Long.class);
    }

    public List<String> extractRoles(String token) {
        String role = extractRole(token);
        return role == null ? List.of() : List.of(role);
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
