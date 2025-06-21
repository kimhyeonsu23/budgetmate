package com.budgetmate.receipt.controller;


import com.budgetmate.receipt.entity.ReceiptItemEntity;
import com.budgetmate.receipt.repository.ReceiptItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.budgetmate.receipt.dto.ReceiptDto;
import com.budgetmate.receipt.service.ReceiptService;

import java.util.List;


@RestController
@RequestMapping("/receipt")
public class ReceiptController {

	private final ReceiptService receiptService;
	private final ReceiptItemRepository receiptItemRepository;

	public ReceiptController(ReceiptService receiptService, ReceiptItemRepository receiptItemRepository) {
		this.receiptService = receiptService;
		this.receiptItemRepository = receiptItemRepository;
	}


	@PostMapping("/createReceipt")
	public ReceiptDto createReceipt(@RequestBody ReceiptDto receiptDto) {
		receiptService.createReceipt(receiptDto);
		return receiptDto;
	}

	@GetMapping("/ledger")
	public List<ReceiptDto> getLedger(@RequestParam("userId") Long userId,
									  @RequestParam(value = "month", required = false) Integer month,
									  @RequestParam(value = "year", required = false) Integer year) {
		if (month != null && year != null) {
			return receiptService.getReceiptsByUserIdAndMonth(userId, year, month);
		}
		return receiptService.getReceiptsByUserId(userId);
	}


	@DeleteMapping("/{receiptId}")
	public ResponseEntity<Void> deleteReceipt(@PathVariable Long receiptId) {
		receiptService.deleteReceipt(receiptId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{receiptId}/items")
	public List<ReceiptItemEntity> getItems(@PathVariable Long receiptId) {
		return receiptItemRepository.findByReceiptIdAndIsDeletedFalse(receiptId);
	}

	@PatchMapping("/{id}/delete")
	public ResponseEntity<Void> softDelete(@PathVariable Long id) {
		receiptService.markAsDeleted(id);
		return ResponseEntity.ok().build();
	}

	@PatchMapping("/{id}/restore")
	public ResponseEntity<Void> restore(@PathVariable Long id) {
		receiptService.unmarkAsDeleted(id);
		return ResponseEntity.ok().build();
	}

}
