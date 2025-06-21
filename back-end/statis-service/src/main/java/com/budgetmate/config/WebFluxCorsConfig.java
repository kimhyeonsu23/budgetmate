//package com.budgetmate
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.reactive.CorsWebFilter;
//import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
//
//import java.util.Arrays;
//
//@Configuration
//public class WebFluxCorsConfig { // CORS 요청을 처리할 설정 객체.  preflight 요청인 OPTIONS에 자동 응답 처리도 해줌.
//
//    @Bean
//    public CorsWebFilter corsWebFilter() {
//        CorsConfiguration config = new CorsConfiguration();  // CORS 관련 설정들을 담는 객체
//        System.out.println("corsWebFilter ! ");
//
//        config.setAllowedOrigins(Arrays.asList(
//            "http://localhost:5173" //, "http://localhost:3000" // spring Security 와 webFlux가 각 따로 CORS를 처리하기 때문에 다시 cors를 처리해야 함.
//        )); // 허용할 origin 목록 (쿠키 인증을 하려면 * 대신 정확한 origin만 허용해야 함.)
//        
//        //허용할 http 메서드 : 클라이언트가 어떤 http 메서드로 요청을 보낼 수 있는지 설정하는 메서드.
//        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//        // 허용할 요청 헤더 (authorization 포함) 모든 헤더를 허용한다면 * : authorization, content-type
//        config.setAllowedHeaders(Arrays.asList("*"));
//        // 자격 증명 (credentials)을 포함한 요청을 허용할지 설정하는 메서드. : 쿠키, 세션, authorization 헤더 등이 여기에 해당. 
//        config.setAllowCredentials(true);
//
//        // source : 위에서 설정한 corsConfiguration을 어떤 url에 적용할지 결정하는 객체를 생성. 
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        // 위에서 만든 cors정책을 모든 경로에 적용한다는 뜻.
//        source.registerCorsConfiguration("/**", config);
//        
//        // webFlux에서는 필터 방식으로 cors 설정
//        return new CorsWebFilter(source);
//    }
//}
//
//// CrossOrigin은 webFlux에서 완전한 대안은 아님. webFlux에서는 corWebFilter를 권장한다고 명시하고 있음.  -> crossOrigin이 항상 적용되는게 아니라 불안정. 
//
////@Configuration
////public class WebFluxCorsConfig {
////
////    @Bean
////    public CorsWebFilter corsWebFilter() {
////        CorsConfiguration config = new CorsConfiguration();
////        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000")); // 정확한 프론트 주소만!
////        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // OPTIONS 꼭!
////        config.setAllowedHeaders(Arrays.asList("*")); // Authorization 헤더 포함 허용
////        config.setAllowCredentials(true); // credentials 허용 (JWT, 쿠키 등)
////
////        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
////        source.registerCorsConfiguration("/**", config); // 모든 URL에 적용
////
////        return new CorsWebFilter(source);
////    }
////}


