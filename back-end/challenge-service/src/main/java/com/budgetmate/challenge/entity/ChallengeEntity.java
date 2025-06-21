package com.budgetmate.challenge.entity;

import com.budgetmate.challenge.enums.ChallengeType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "challenge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private ChallengeType type;

    private String targetCategory;    // CATEGORY_LIMIT 전용

    private Integer targetAmount;     // 지출 상한 or 절약 목표

    private LocalDate startDate;
    private LocalDate endDate;

    private boolean success;          // 성공 여부
    private boolean evaluated;        // 평가 완료 여부
    private boolean deleted;
}