package com.budgetmate.receipt.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OverspendResponseDto {
    private Long userId;
    private int year;
    private int month;
    private Long budget;
    private Long totalSpent;
    private boolean overspent;
    private String message;
}
