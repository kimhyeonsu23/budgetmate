package com.budgetmate.challenge.service;

import com.budgetmate.challenge.client.BudgetClient;
import com.budgetmate.challenge.dto.ChallengeRequestDto;
import com.budgetmate.challenge.dto.ChallengeResponseDto;
import com.budgetmate.challenge.entity.ChallengeEntity;
import com.budgetmate.challenge.enums.ChallengeType;
import com.budgetmate.challenge.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final BudgetClient budgetClient;

    // 챌린지 등록
    @Transactional
    public ChallengeResponseDto createChallenge(Long userId, ChallengeRequestDto request) {
        Integer targetAmount = request.getTargetAmount();

        if (request.getType() == ChallengeType.SAVING) {
            LocalDate start = request.getStartDate();
            LocalDate end = request.getEndDate();
            LocalDate firstDay = start.withDayOfMonth(1);
            LocalDate lastDay = start.withDayOfMonth(start.lengthOfMonth());

            // 한 달 전체 기간인지 체크
            if (!start.equals(firstDay) || !end.equals(lastDay)) {
                throw new IllegalArgumentException("절약 챌린지는 반드시 해당 월의 1일부터 말일까지 설정해야 합니다.");
            }

            int year = start.getYear();
            int month = start.getMonthValue();
            int monthlyBudget = budgetClient.getMonthlyBudget(userId, year, month);
            targetAmount = (int) Math.round(monthlyBudget * 0.1); // 예산의 10%
        }

        ChallengeEntity challenge = ChallengeEntity.builder()
                .userId(userId)
                .type(request.getType())
                .targetCategory(request.getTargetCategory())
                .targetAmount(targetAmount)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .success(false)
                .evaluated(false)
                .deleted(false)
                .build();

        ChallengeEntity saved = challengeRepository.save(challenge);
        return toResponseDto(saved);
    }

    // 사용자 챌린지 전체 조회
    public List<ChallengeResponseDto> getChallenges(Long userId) {
        return challengeRepository.findByUserIdAndDeletedFalse(userId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // 평가되지 않은 만료 챌린지 가져오기 (스케줄러 용)
    public List<ChallengeEntity> getExpiredUnevaluatedChallenges() {
        return challengeRepository.findByEndDateBeforeAndEvaluatedFalse(LocalDate.now());
    }


    // 삭제 처리 (Soft delete)
    @Transactional
    public void deleteChallenge(Long id) {
        ChallengeEntity challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("챌린지를 찾을 수 없습니다."));
        challenge.setDeleted(true);
        challengeRepository.save(challenge);
    }

    private ChallengeResponseDto toResponseDto(ChallengeEntity entity) {
        return ChallengeResponseDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .targetCategory(entity.getTargetCategory())
                .targetAmount(entity.getTargetAmount())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .success(entity.isSuccess())
                .evaluated(entity.isEvaluated())
                .build();
    }
}