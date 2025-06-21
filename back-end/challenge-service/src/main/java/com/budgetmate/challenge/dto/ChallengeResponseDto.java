package com.budgetmate.challenge.dto;

import com.budgetmate.challenge.enums.ChallengeType;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeResponseDto {
    private Long id;
    private ChallengeType type;
    private String targetCategory;
    private Integer targetAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean success;
}