package com.budgetmate.challenge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChallengeServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChallengeServiceApplication.class, args);
	}

}
