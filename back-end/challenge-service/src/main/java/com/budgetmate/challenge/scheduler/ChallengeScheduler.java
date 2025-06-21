package com.budgetmate.challenge.scheduler;

import com.budgetmate.challenge.entity.ChallengeEntity;
import com.budgetmate.challenge.repository.ChallengeRepository;
import com.budgetmate.challenge.service.ChallengeEvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChallengeScheduler {

    private final ChallengeRepository challengeRepository;
    private final ChallengeEvaluationService evaluationService;

    /**
     * 매일 새벽 3시에 평가되지 않은 챌린지를 찾아 자동 평가
     */
    @Scheduled(cron = "0 0 3 * * *") // 매일 3:00 AM
    public void evaluateExpiredChallenges() {
        LocalDate today = LocalDate.now();
        log.info("🌙 [Scheduler] 챌린지 평가 시작 - 날짜: {}", today);

        //  아직 평가되지 않은 종료된 챌린지 조회
        List<ChallengeEntity> expiredChallenges =
                challengeRepository.findByEndDateBeforeAndEvaluatedFalseAndDeletedFalse(today);

        log.info("📝 평가 대상 챌린지 수: {}", expiredChallenges.size());

        for (ChallengeEntity challenge : expiredChallenges) {
            try {
                evaluationService.evaluateChallenge(challenge);
                log.info("✅ 챌린지 평가 완료 - ID: {}", challenge.getId());
            } catch (Exception e) {
                log.error("❌ 챌린지 평가 실패 - ID: {}, 이유: {}", challenge.getId(), e.getMessage());
            }
        }

        log.info("🛑 [Scheduler] 챌린지 평가 종료");
    }
}
