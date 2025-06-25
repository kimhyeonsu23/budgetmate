package com.budgetmate.challenge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) { // ServerHttpSecurity : spring Security에서 제공하는 webFlux용 안 설정 빌더 클래스

        return http
                .csrf(csrf -> csrf.disable())
                .authorizeExchange(
                        exchange
                                -> exchange
                                .anyExchange().permitAll()
                )
                .build();

    }

}