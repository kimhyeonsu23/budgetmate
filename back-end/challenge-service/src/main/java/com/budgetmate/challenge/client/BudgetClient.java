package com.budgetmate.challenge.client;

import com.budgetmate.challenge.dto.BudgetResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Component
@RequiredArgsConstructor
public class BudgetClient {

    private final WebClient budgetWebClient;

    public int getMonthlyBudget(Long userId, int year, int month) {
        try {
            return budgetWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/budget")
                            .queryParam("userId", userId)
                            .queryParam("year", year)
                            .queryParam("month", month)
                            .build())
                    .retrieve()
                    .bodyToMono(BudgetResponseDto.class)
                    .map(dto -> dto.getBudget() != null ? dto.getBudget().intValue() : 0)
                    .block(); // 동기 방식

        } catch (WebClientResponseException e) {
            log.error("[BudgetClient] WebClient 응답 오류 - status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return 0;
        } catch (Exception e) {
            log.error("[BudgetClient] 예외 발생: {}", e.getMessage(), e);
            return 0;
        }
    }
}
