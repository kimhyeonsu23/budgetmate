package com.budgetmate.challenge.service;

import com.budgetmate.challenge.client.BudgetClient;
import com.budgetmate.challenge.client.StatisClient;
import com.budgetmate.challenge.client.UserClient;
import com.budgetmate.challenge.entity.ChallengeEntity;
import com.budgetmate.challenge.repository.ChallengeRepository;
import com.budgetmate.challenge.util.TokenParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeEvaluationService {

    private final ChallengeRepository challengeRepository;
    private final StatisClient statisClient;
    private final BudgetClient budgetClient;
    private final UserClient userClient;
    private final TokenParser tokenParser;

    private final int REWARD_POINT = 2;

    /**
     * 외부에서 Authorization 기반 평가
     */
    @Transactional
    public void evaluateChallenge(ChallengeEntity challenge, String authHeader) {
        if (challenge.isDeleted()) {
            log.warn("⛔ 삭제된 챌린지(ID: {})는 평가 대상에서 제외됩니다.", challenge.getId());
            return;
        }

        Long userId = tokenParser.getUserIdFromToken(authHeader.replace("Bearer ", "").trim());
        evaluate(challenge, userId, authHeader);
    }

    /**
     * 내부 평가 (auth 없이 모든 챌린지 유형 지원)
     */
    @Transactional
    public void evaluateChallengeInternal(ChallengeEntity challenge) {
        if (challenge.isDeleted() || challenge.isEvaluated()) {
            log.warn("⛔ 제외 대상 챌린지 (ID: {})", challenge.getId());
            return;
        }

        Long userId = challenge.getUserId();
        LocalDate start = challenge.getStartDate();
        LocalDate end = challenge.getEndDate();
        boolean success = false;

        try {
            switch (challenge.getType()) {
                case SAVING -> {
                    int budget = budgetClient.getMonthlyBudget(userId, start.getYear(), start.getMonthValue());
                    int actualSpent = statisClient.getMonthlySpent(userId, start.getYear(), start.getMonthValue());

                    if (budget == 0) {
                        log.warn("SAVING ▶ 예산이 0원입니다. 평가 불가 (userId: {})", userId);
                        return;
                    }

                    double savingRate = ((double) (budget - actualSpent) / budget) * 100;
                    log.info("SAVING ▶ 예산: {}, 소비액: {}, 절약률: {}%", budget, actualSpent, savingRate);
                    success = savingRate >= 10.0;
                }

                case NO_SPENDING -> {
                    int totalSpent = statisClient.getSpentBetween(userId, start, end);
                    log.info("NO_SPENDING ▶ 총 소비액: {}", totalSpent);
                    success = totalSpent <= challenge.getTargetAmount();
                }

                case CATEGORY_LIMIT -> {
                    int spent = statisClient.getCategorySpentBetween(userId, start, end, challenge.getTargetCategory());
                    log.info("CATEGORY_LIMIT ▶ {} 소비액: {}", challenge.getTargetCategory(), spent);
                    success = spent <= challenge.getTargetAmount();
                }

                default -> {
                    log.warn("지원되지 않는 챌린지 유형: {}", challenge.getType());
                    return;
                }
            }

            if (success) {
                userClient.addPoint(userId, REWARD_POINT);
                challenge.setSuccess(true);
                log.info("🎉 챌린지 성공! 포인트 {}점 지급 완료 (userId: {})", REWARD_POINT, userId);
            } else {
                log.info("😢 챌린지 실패 (userId: {})", userId);
            }

            challenge.setEvaluated(true);
            challengeRepository.save(challenge);
        } catch (Exception e) {
            log.error("❌ 챌린지 평가 중 예외 발생 (ID: {}): {}", challenge.getId(), e.getMessage());
        }
    }

    /**
     * Authorization 기반 평가 내부 로직
     */
    private void evaluate(ChallengeEntity challenge, Long userId, String authHeader) {
        LocalDate start = challenge.getStartDate();
        boolean success = false;

        try {
            switch (challenge.getType()) {
                case NO_SPENDING -> {
                    int totalSpent = statisClient.getTotalSpent(authHeader);
                    log.info("NO_SPENDING ▶ 총 소비액: {}", totalSpent);
                    success = totalSpent <= challenge.getTargetAmount();
                }

                case CATEGORY_LIMIT -> {
                    Map<String, Integer> categoryMap = statisClient.getCategorySpent(authHeader);
                    int spent = categoryMap.getOrDefault(challenge.getTargetCategory(), 0);
                    log.info("CATEGORY_LIMIT ▶ {} 소비액: {}", challenge.getTargetCategory(), spent);
                    success = spent <= challenge.getTargetAmount();
                }

                case SAVING -> {
                    int budget = budgetClient.getMonthlyBudget(userId, start.getYear(), start.getMonthValue());
                    int actualSpent = statisClient.getMonthlySpent(authHeader);

                    if (budget == 0) {
                        log.warn("SAVING ▶ 예산이 0원입니다. 평가 불가 (userId: {})", userId);
                        break;
                    }

                    double savingRate = ((double) (budget - actualSpent) / budget) * 100;
                    log.info("SAVING ▶ 예산: {}, 소비액: {}, 절약률: {}%", budget, actualSpent, savingRate);
                    success = savingRate >= 10.0;
                }
            }

            if (success) {
                userClient.addPoint(userId, REWARD_POINT);
                challenge.setSuccess(true);
                log.info("🎉 챌린지 성공! 포인트 {}점 지급 완료 (userId: {})", REWARD_POINT, userId);
            } else {
                log.info("😢 챌린지 실패 (userId: {})", userId);
            }

            challenge.setEvaluated(true);
            challengeRepository.save(challenge);
        } catch (Exception e) {
            log.error("❌ 챌린지 평가 중 예외 발생 (ID: {}): {}", challenge.getId(), e.getMessage());
        }
    }
}
