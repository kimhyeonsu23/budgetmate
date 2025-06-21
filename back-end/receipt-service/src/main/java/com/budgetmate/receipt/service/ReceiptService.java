package com.budgetmate.receipt.service;

import com.budgetmate.receipt.entity.ReceiptItemEntity;
import com.budgetmate.receipt.repository.ReceiptItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.budgetmate.receipt.dto.ReceiptDto;
import com.budgetmate.receipt.entity.ReceiptEntity;
import com.budgetmate.receipt.repository.ReceiptRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReceiptService {

	private final ReceiptRepository receiptRepository;
	private final ReceiptItemRepository receiptItemRepository;

	@Autowired
	public ReceiptService(ReceiptRepository receiptRepository, ReceiptItemRepository receiptItemRepository) {
		this.receiptRepository = receiptRepository;
		this.receiptItemRepository = receiptItemRepository;
	}

	public void createReceipt(ReceiptDto dto) {
		ReceiptEntity receipt = ReceiptEntity.builder()
				.shop(dto.getShop())
				.imagePath(dto.getImagePath())
				.userId(dto.getUserId())
				.date(dto.getDate())
				.keywordId(dto.getKeywordId())
				.totalPrice(dto.getTotalPrice())
				.build();

		receiptRepository.save(receipt);
	}

	public List<ReceiptDto> getReceiptsByUserId(Long userId) {
		return receiptRepository.findByUserIdAndIsDeletedFalse(userId).stream()
				.map(entity -> ReceiptDto.builder()
						.receiptId(entity.getReceiptId())
						.shop(entity.getShop())
						.userId(entity.getUserId())
						.imagePath(entity.getImagePath())
						.date(entity.getDate())
						.keywordId(entity.getKeywordId())
						.totalPrice(entity.getTotalPrice())
						.build())
				.collect(Collectors.toList());
	}

	@Transactional
	public void saveReceiptWithItems(ReceiptDto dto, List<ReceiptItemEntity> items) {
		ReceiptEntity receipt = receiptRepository.save(ReceiptEntity.builder()
				.shop(dto.getShop())
				.imagePath(dto.getImagePath())
				.userId(dto.getUserId())
				.date(dto.getDate())
				.keywordId(dto.getKeywordId())
				.totalPrice(dto.getTotalPrice())
				.build());

		items.forEach(i -> i.setReceiptId(receipt.getReceiptId()));
		receiptItemRepository.saveAll(items);
	}

	@Transactional
	public void markAsDeleted(Long id) {
		ReceiptEntity receipt = receiptRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("해당 영수증이 존재하지 않습니다."));
		receipt.setIsDeleted(true);

		List<ReceiptItemEntity> items = receiptItemRepository.findByReceiptId(id);
		items.forEach(i -> i.setIsDeleted(true));
		receiptItemRepository.saveAll(items);
	}

	@Transactional
	public void unmarkAsDeleted(Long id) {
		ReceiptEntity receipt = receiptRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("해당 영수증이 존재하지 않습니다."));
		receipt.setIsDeleted(false);

		List<ReceiptItemEntity> items = receiptItemRepository.findByReceiptId(id);
		items.forEach(i -> i.setIsDeleted(false));
		receiptItemRepository.saveAll(items);
	}

	// 사용 안 한다면 완전히 삭제 가능
	@Deprecated
	@Transactional
	public void deleteReceipt(Long receiptId) {
		markAsDeleted(receiptId); // 내부적으로 soft delete 처리
	}

	public List<ReceiptDto> getReceiptsByUserIdAndMonth(Long userId, int year, int month) {
		List<ReceiptEntity> entities = receiptRepository.findByUserIdAndMonth(userId, year, month);
		return entities.stream()
				.map(entity -> ReceiptDto.builder()
						.receiptId(entity.getReceiptId())
						.shop(entity.getShop())
						.userId(entity.getUserId())
						.imagePath(entity.getImagePath())
						.date(entity.getDate())
						.keywordId(entity.getKeywordId())
						.totalPrice(entity.getTotalPrice())
						.build())
				.collect(Collectors.toList());
	}

}
