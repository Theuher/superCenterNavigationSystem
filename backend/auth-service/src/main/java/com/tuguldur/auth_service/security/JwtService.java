package com.tuguldur.auth_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${app.security.jwt.secret}")
    private String secret;

    @Value("${app.security.jwt.expiration-minutes}")
    private long expirationMinutes;

    public String generateToken(String subject, Set<String> roles) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(subject)
                .claims(Map.of("roles", roles))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
                .signWith(signingKey())
                .compact();
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public Set<String> extractRoles(String token) {
        Claims claims = parseClaims(token);
        Object rolesClaim = claims.get("roles");
        if (rolesClaim instanceof Set<?> roleSet) {
            return roleSet.stream().map(Object::toString).collect(java.util.stream.Collectors.toSet());
        }
        if (rolesClaim instanceof java.util.List<?> roleList) {
            return roleList.stream().map(Object::toString).collect(java.util.stream.Collectors.toSet());
        }
        return Set.of();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Key signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}


