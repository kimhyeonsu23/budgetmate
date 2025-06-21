package com.budgetmate.receipt.repository;

import com.budgetmate.receipt.entity.ReceiptItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceiptItemRepository extends JpaRepository<ReceiptItemEntity, Long> {
    List<ReceiptItemEntity> findByReceiptIdAndIsDeletedFalse(Long receiptId);
    List<ReceiptItemEntity> findByReceiptId(Long receiptId);
}
