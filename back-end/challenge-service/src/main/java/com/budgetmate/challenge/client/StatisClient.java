package com.budgetmate.challenge.client;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class StatisClient {

    private final WebClient statisWebClient;

    //  이번 주 총 소비액 (Authorization 기반)
    public int getTotalSpent(String authHeader) {
        return statisWebClient.get()
                .uri("/statis/getReceipt/calCurrentWeek")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(Integer.class)
                .block();
    }

    //  이번 주 카테고리별 소비액 (Authorization 기반)
    public Map<String, Integer> getCategorySpent(String authHeader) {
        return statisWebClient.get()
                .uri("/statis/getReceipt/calKeywordTotalPriceWeekly")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Integer>>() {})
                .block();
    }

    //  이번 달 총 소비액 (Authorization 기반)
    public int getMonthlySpent(String authHeader) {
        return statisWebClient.get()
                .uri("/statis/getReceipt/calMonthlyTotal")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(Integer.class)
                .block();
    }

    public int getMonthlySpent(Long userId, int year, int month) {
        return statisWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/statis/spending/monthly-total")
                        .queryParam("userId", userId)
                        .queryParam("year", year)
                        .queryParam("month", month)
                        .build())
                .retrieve()
                .bodyToMono(Integer.class)
                .block();
    }

    public int getSpentBetween(Long userId, LocalDate start, LocalDate end) {
        return statisWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/statis/spending/total")
                        .queryParam("userId", userId)
                        .queryParam("start", start)
                        .queryParam("end", end)
                        .build())
                .retrieve()
                .bodyToMono(Integer.class)
                .block();
    }

    public int getCategorySpentBetween(Long userId, LocalDate start, LocalDate end, String category) {
        return statisWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/statis/spending/category-between")
                        .queryParam("userId", userId)
                        .queryParam("start", start)
                        .queryParam("end", end)
                        .queryParam("category", category)
                        .build())
                .retrieve()
                .bodyToMono(Integer.class)
                .block();
    }

}
