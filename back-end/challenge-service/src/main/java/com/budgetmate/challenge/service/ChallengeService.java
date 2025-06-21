package com.budgetmate.challenge.service;

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

    // 챌린지 등록
    @Transactional
    public ChallengeResponseDto createChallenge(Long userId, ChallengeRequestDto request) {
        ChallengeEntity challenge = ChallengeEntity.builder()
                .userId(userId)
                .type(request.getType())
                .targetCategory(request.getTargetCategory())
                .targetAmount(request.getTargetAmount())
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

    // 평가 후 상태 업데이트
    @Transactional
    public void evaluateChallenge(ChallengeEntity challenge, boolean isSuccess) {
        challenge.setSuccess(isSuccess);
        challenge.setEvaluated(true);
        challengeRepository.save(challenge);
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
                .build();
    }
}