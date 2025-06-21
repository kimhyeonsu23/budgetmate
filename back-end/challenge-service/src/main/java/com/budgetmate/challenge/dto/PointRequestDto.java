package com.budgetmate.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PointRequestDto {
    private Long userId;
    private int point;
}
