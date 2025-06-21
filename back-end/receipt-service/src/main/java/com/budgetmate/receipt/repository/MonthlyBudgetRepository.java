package com.budgetmate.receipt.repository;

import com.budgetmate.receipt.entity.MonthlyBudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudgetEntity, Long> {
    Optional<MonthlyBudgetEntity> findByUserIdAndYearAndMonth(Long userId, int year, int month);
}
