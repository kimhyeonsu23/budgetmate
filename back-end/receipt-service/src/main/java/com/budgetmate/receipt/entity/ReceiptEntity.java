package com.budgetmate.receipt.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "receipt")
public class ReceiptEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long receiptId;

	@Column(length = 50)
	private String shop;

	@Column(name = "image_path", length = 255)
	private String imagePath;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "keyword_id", nullable = false)
	private Long keywordId;

	@Column(name = "total_price", nullable = false)
	private Long totalPrice;

	@Builder.Default
	@Column(nullable = false)
	private LocalDate date = LocalDate.now();

	@Builder.Default
	@Column(name = "is_deleted", nullable = false)
	private boolean isDeleted = false;

	public boolean isDeleted() {
		return isDeleted;
	}

	public void setIsDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}
}
