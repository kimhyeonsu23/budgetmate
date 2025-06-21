package com.budgetmate.receipt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptItemDto {
    private String itemName;
    private Integer unitPrice;
    private Integer quantity;
    private Integer totalPrice;
}
