package com.budgetmate.receipt.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_budget")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyBudgetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private int year;
    private int month;
    private Long budget;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

