package com.budgetmate.challenge.controller;

import com.budgetmate.challenge.entity.ChallengeEntity;
import com.budgetmate.challenge.repository.ChallengeRepository;
import com.budgetmate.challenge.service.ChallengeEvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/challenge/test")
@RequiredArgsConstructor
public class ChallengeTestController {

    private final ChallengeRepository challengeRepository;
    private final ChallengeEvaluationService evaluationService;

    //  단일 챌린지 강제 평가 (ID로 평가)
    @PostMapping("/evaluate/{id}")
    public ResponseEntity<String> forceEvaluate(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        ChallengeEntity challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("챌린지를 찾을 수 없습니다."));

        evaluationService.evaluateChallenge(challenge, authHeader);
        return ResponseEntity.ok("챌린지 평가 완료");
    }

    //  만료된 챌린지 전체 평가 (evaluated = false 조건 포함)
    @PostMapping("/evaluate/all-expired")
    public ResponseEntity<String> evaluateAllExpiredChallenges(
            @RequestHeader("Authorization") String authHeader) {

        List<ChallengeEntity> expiredChallenges =
                challengeRepository.findByEndDateBeforeAndEvaluatedFalseAndDeletedFalse(LocalDate.now());

        for (ChallengeEntity challenge : expiredChallenges) {
            evaluationService.evaluateChallenge(challenge, authHeader);
        }

        return ResponseEntity.ok("만료 챌린지 모두 평가 완료");
    }

}
