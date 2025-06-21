package com.budgetmate.receipt.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaveReceiptRequest {
    private String path;
    private Long userId;
    private Long keywordId;
    private String shopName;
    private LocalDate date;
    private int totalPrice;
    private List<ReceiptItemDto> items;
}
