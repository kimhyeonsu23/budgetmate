package com.budgetmate.receipt.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OcrResultDto {
    private String shopName;
    private LocalDate date;
    private int totalPrice;
    private String imagePath;
    private List<ReceiptItemDto> items;

    public OcrResultDto(String shopName, LocalDate date, int totalPrice) {
        this.shopName = shopName;
        this.date = date;
        this.totalPrice = totalPrice;
        this.imagePath = "";
    }

    public OcrResultDto(String shopName, LocalDate date, int totalPrice, String imagePath) {
        this.shopName = shopName;
        this.date = date;
        this.totalPrice = totalPrice;
        this.imagePath = imagePath;
    }
}
