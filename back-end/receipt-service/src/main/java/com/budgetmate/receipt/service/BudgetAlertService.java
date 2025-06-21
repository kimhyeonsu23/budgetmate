package com.budgetmate.receipt.service;

import com.budgetmate.receipt.dto.OverspendResponseDto;
import com.budgetmate.receipt.entity.MonthlyBudgetEntity;
import com.budgetmate.receipt.repository.MonthlyBudgetRepository;
import com.budgetmate.receipt.repository.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetAlertService {

    private final MonthlyBudgetRepository budgetRepository;
    private final ReceiptRepository receiptRepository;

    public OverspendResponseDto checkOverspend(Long userId, int year, int month) {
        Long budget = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month)
                .map(MonthlyBudgetEntity::getBudget)
                .orElse(0L);

        Long spent = receiptRepository
                .sumTotalPriceByUserIdAndMonth(userId, year, month)
                .orElse(0L);

        boolean overspent = spent > budget;

        String message = overspent
                ? String.format("예산을 초과했습니다! (%,d원 / %,d원)", spent, budget)
                : String.format("아직 예산 범위 내에 있습니다. (%d / %d)", spent, budget);

        return new OverspendResponseDto(userId, year, month, budget, spent, overspent, message);
    }
}
