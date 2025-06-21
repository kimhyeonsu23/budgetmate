package com.budgetmate.receipt.mapper;

import com.budgetmate.receipt.dto.ReceiptItemDto;
import com.budgetmate.receipt.entity.ReceiptItemEntity;

import java.util.List;
import java.util.stream.Collectors;

public class ReceiptItemMapper {

    public static List<ReceiptItemEntity> toEntityList(List<ReceiptItemDto> dtoList) {
        return dtoList.stream()
                .map(dto -> ReceiptItemEntity.builder()
                        .itemName(dto.getItemName())
                        .unitPrice(dto.getUnitPrice())
                        .quantity(dto.getQuantity())
                        .totalPrice(dto.getTotalPrice())
                        .build())
                .collect(Collectors.toList());
    }
}
