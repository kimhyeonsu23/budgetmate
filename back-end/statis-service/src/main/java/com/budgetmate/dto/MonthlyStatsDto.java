package com.budgetmate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class MonthlyStatsDto {
    private int totalSpending;
    private Map<String, Integer> categoryStats;
    private int budget;
}
