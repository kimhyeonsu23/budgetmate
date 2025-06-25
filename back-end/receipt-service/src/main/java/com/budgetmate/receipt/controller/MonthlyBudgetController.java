package com.budgetmate.receipt.controller;

import com.budgetmate.receipt.dto.OverspendResponseDto;
import com.budgetmate.receipt.entity.MonthlyBudgetEntity;
import com.budgetmate.receipt.repository.MonthlyBudgetRepository;
import com.budgetmate.receipt.service.BudgetAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/budget")
@RequiredArgsConstructor
public class MonthlyBudgetController {

    private final MonthlyBudgetRepository repository;
    private final BudgetAlertService budgetAlertService;

    @GetMapping({"", "/"})
    public ResponseEntity<MonthlyBudgetEntity> getBudget(
            @RequestParam Long userId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return repository.findByUserIdAndYearAndMonth(userId, year, month)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(
                        MonthlyBudgetEntity.builder()
                                .userId(userId)
                                .year(year)
                                .month(month)
                                .budget(0L) // ← 예산 기본값
                                .build()
                ));
    }


    @PostMapping
    public ResponseEntity<Void> setBudget(@RequestBody MonthlyBudgetEntity dto) {
        Optional<MonthlyBudgetEntity> existing = repository.findByUserIdAndYearAndMonth(
                dto.getUserId(), dto.getYear(), dto.getMonth());

        if (existing.isPresent()) {
            MonthlyBudgetEntity entity = existing.get();
            entity.setBudget(dto.getBudget());
            repository.save(entity); // 수정
        } else {
            repository.save(dto); // 신규 생성
        }

        return ResponseEntity.ok().build();
    }
    @GetMapping("/overspent")
    public ResponseEntity<OverspendResponseDto> checkOverspent(
            @RequestParam Long userId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(budgetAlertService.checkOverspend(userId, year, month));
    }

}

