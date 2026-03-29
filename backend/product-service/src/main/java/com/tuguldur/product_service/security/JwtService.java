package com.tuguldur.product_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${app.security.jwt.secret}")
    private String secret;

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public Set<String> extractRoles(String token) {
        Object rolesClaim = parseClaims(token).get("roles");
        if (rolesClaim instanceof Set<?> roleSet) {
            return roleSet.stream().map(Object::toString).collect(Collectors.toSet());
        }
        if (rolesClaim instanceof List<?> roleList) {
            return roleList.stream().map(Object::toString).collect(Collectors.toSet());
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

