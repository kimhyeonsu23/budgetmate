package com.budgetmate.security;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component	// spring의 빈으로 등록되도록 함.
public class TokenParser {
	
	@Value("${jwt.secret}")
	private String secretKey;
	
	public Long getUserIdFromToken(String token) {

		Claims claims = Jwts.parser()
				.verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))
				.build()
				.parseSignedClaims(token)
				.getBody();
		
		return claims.get("id", Long.class);
	}

}
