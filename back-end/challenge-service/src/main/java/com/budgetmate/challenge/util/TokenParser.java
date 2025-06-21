package com.budgetmate.challenge.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class TokenParser {

    @Value("${jwt.secret}")
    private String secretKey;

    public Long getUserIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "").trim();
        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getBody();
        return claims.get("id", Long.class);
    }
}