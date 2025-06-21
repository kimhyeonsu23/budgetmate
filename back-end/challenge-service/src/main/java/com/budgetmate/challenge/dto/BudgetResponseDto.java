package com.budgetmate.challenge.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BudgetResponseDto {
    private Long userId;
    private int year;
    private int month;
    private Long budget;
}