package com.budgetmate.receipt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.budgetmate.receipt.entity.ReceiptEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReceiptRepository extends JpaRepository<ReceiptEntity, Long> {

    List<ReceiptEntity> findByUserIdAndIsDeletedFalse(Long userId);

    @Query("SELECT SUM(r.totalPrice) FROM ReceiptEntity r " +
            "WHERE r.userId = :userId " +
            "AND r.isDeleted = false " +
            "AND YEAR(r.date) = :year " +
            "AND MONTH(r.date) = :month")
    Optional<Long> sumTotalPriceByUserIdAndMonth(@Param("userId") Long userId,
                                                 @Param("year") int year,
                                                 @Param("month") int month);
    @Query("SELECT r FROM ReceiptEntity r WHERE r.userId = :userId AND r.isDeleted = false AND YEAR(r.date) = :year AND MONTH(r.date) = :month")
    List<ReceiptEntity> findByUserIdAndMonth(@Param("userId") Long userId, @Param("year") int year, @Param("month") int month);

}
