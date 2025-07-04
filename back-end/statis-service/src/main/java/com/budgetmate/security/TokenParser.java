package com.budgetmate.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;


@Component	// spring의 빈으로 등록되도록 함.
public class TokenParser {
	
	@Value("${jwt.secret}")
	private String secretKey;

	public Long getUserIdFromToken(String token) {
		System.out.println("=== token parser 진입 ===");
		System.out.println("token = " + token);

		if (token == null || !token.contains(".")) {
			throw new IllegalArgumentException("잘못된 JWT 형식입니다: " + token);
		}

		Claims claims = Jwts.parser()
				.verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))
				.build()
				.parseSignedClaims(token)
				.getBody();

		return claims.get("id", Long.class);
	}

}
