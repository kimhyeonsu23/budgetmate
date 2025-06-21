package com.budgetmate.challenge.repository;

import com.budgetmate.challenge.entity.ChallengeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ChallengeRepository extends JpaRepository<ChallengeEntity, Long> {

    // 사용자의 모든 활성 챌린지 목록
    List<ChallengeEntity> findByUserIdAndDeletedFalse(Long userId);

    // 평가되지 않은 만료 챌린지 목록 (스케줄러 용)
    List<ChallengeEntity> findByEndDateBeforeAndEvaluatedFalse(LocalDate today);

    List<ChallengeEntity> findByEndDateBeforeAndEvaluatedFalseAndDeletedFalse(LocalDate today);

}