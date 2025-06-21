package com.budgetmate.receipt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}
/*
	@Bean
	public RouteLocator myRoutes(RouteLocatorBuilder builder) {
	    return builder.routes()
	        .route(p -> p
	            .path("/get")
	            .filters(f -> f.addRequestHeader("Hello", "World"))
	            .uri("http://httpbin.org:80"))
	        .route(p -> p
	            .path("/user/**")
	            .filters(f -> f.addRequestHeader("service-name", "user"))
	            .uri("http://localhost:8081/user"))
	        .build();
	}
*/
	
//	@Bean
//	public RouteLocator userRoutes(RouteLocatorBuilder builder) {
//		
//		return builder.routes()
//				.route("user_route", p -> p
//						.path("/createUser")
//						//.method(HttpMethod.POST)
//						.uri("http://localhost:8081"))
//				.build();
//		
//	}

	
}
