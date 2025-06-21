package com.budgetmate.receipt.dto;

import java.time.LocalDate;

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
public class ReceiptDto {
	private Long receiptId;
	private String shop;
	private Long userId;
	private String imagePath;
	private LocalDate date;
	private Long keywordId;

	private Long totalPrice;
}
