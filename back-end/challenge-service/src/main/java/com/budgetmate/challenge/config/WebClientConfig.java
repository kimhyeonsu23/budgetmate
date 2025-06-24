package com.budgetmate.challenge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient statisWebClient() {
        return WebClient.builder()
                .baseUrl("http://gateway:8090") // Gateway 주소
                .build();
    }

    @Bean
    public WebClient budgetWebClient() {
        return WebClient.builder()
                .baseUrl("http://gateway:8090") // Gateway 주소
                .build();
    }

    @Bean
    public WebClient userWebClient() {
        return WebClient.builder()
                .baseUrl("http://gateway:8090") // Gateway 주소
                .build();
    }

}