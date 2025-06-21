package com.budgetmate.challenge.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserClient {

    private final WebClient userWebClient;

    public void addPoint(Long userId, int point) {
        Map<String, Object> request = Map.of(
                "userId", userId,
                "point", point
        );

        try {
            userWebClient.post()
                    .uri("/user/point/increase")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> {
                                log.error("[UserClient] 포인트 지급 실패 - 상태 코드: {}", clientResponse.statusCode());
                                return clientResponse.createException();
                            }
                    )
                    .bodyToMono(Void.class)
                    .block();  // 동기 호출

            log.info("[UserClient] 포인트 지급 성공 - userId: {}, point: {}", userId, point);
        } catch (WebClientResponseException e) {
            log.error("[UserClient] WebClient 응답 예외 발생 - status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("[UserClient] 포인트 지급 중 예외 발생: {}", e.getMessage(), e);
        }
    }
}
