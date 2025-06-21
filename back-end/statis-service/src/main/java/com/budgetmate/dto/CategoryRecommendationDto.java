package com.budgetmate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CategoryRecommendationDto {
    private String overspentCategory;
    private String reason;
}
