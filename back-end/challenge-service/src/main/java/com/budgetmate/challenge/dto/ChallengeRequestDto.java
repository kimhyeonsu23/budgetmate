package com.budgetmate.challenge.dto;

import com.budgetmate.challenge.enums.ChallengeType;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeRequestDto {
    private ChallengeType type;
    private String targetCategory;     // CATEGORY_LIMIT 용
    private Integer targetAmount;      // 절약 목표나 지출 상한
    private LocalDate startDate;
    private LocalDate endDate;
}