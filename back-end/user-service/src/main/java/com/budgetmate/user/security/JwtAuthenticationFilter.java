package com.budgetmate.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        logger.debug("[JwtAuthenticationFilter] 요청 URI: {}", requestURI);

        if (
                requestURI.equals("/user/login") ||
                        requestURI.equals("/user/signup") ||
                        requestURI.equals("/user/send-code") ||         // 인증코드 요청 허용
                        requestURI.equals("/user/verify-code")          // 인증코드 검증 허용
        ) {
            logger.debug("[JwtAuthenticationFilter] 인증 예외 경로 - 필터 건너뜀: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }


        String token = jwtTokenProvider.resolveToken(request);
        logger.debug("[JwtAuthenticationFilter] 추출한 토큰: {}", token);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            Authentication auth = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
            logger.debug("[JwtAuthenticationFilter] 인증 완료 - 사용자: {}", auth.getName());
        }

        filterChain.doFilter(request, response);
    }
}