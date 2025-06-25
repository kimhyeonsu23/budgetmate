package com.budgetmate.challenge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/**")
                .authorizeHttpRequests((authz) -> authz
                        .anyRequest().permitAll()  // 모든 요청 허용 (인증 없이)
                )
                .csrf((csrf) -> csrf.disable());  // CSRF 비활성화

        return http.build();
    }
}
