package com.budgetmate.receipt.controller;

import com.budgetmate.receipt.dto.OcrResultDto;
import com.budgetmate.receipt.dto.ReceiptDto;
import com.budgetmate.receipt.dto.SaveReceiptRequest;
import com.budgetmate.receipt.entity.ReceiptItemEntity;
import com.budgetmate.receipt.mapper.ReceiptItemMapper;
import com.budgetmate.receipt.repository.ReceiptItemRepository;
import com.budgetmate.receipt.service.OcrService;
import com.budgetmate.receipt.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/receipt")
public class OcrController {

    private final OcrService ocrService;
    private final ReceiptService receiptService;
    private final ReceiptItemRepository receiptItemRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostMapping("/ocr")
    public ResponseEntity<OcrResultDto> analyzeByPath(@RequestParam("path") String relativePath) {
        String filename = Paths.get(relativePath).getFileName().toString();
        String fullPath = Paths.get(uploadDir, filename).toString();

        try {
            OcrResultDto dto = ocrService.analyzeReceiptFromFile(fullPath);
            dto.setImagePath(relativePath);
            return ResponseEntity.ok(dto);
        } catch (IOException e) {
            log.error("OCR 처리 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/ocr/save")
    public ResponseEntity<Void> analyzeAndSave(
            @RequestParam("path") String relativePath,
            @RequestParam("userId") Long userId,
            @RequestParam("keywordId") Long keywordId
    ) {
        String filename = Paths.get(relativePath).getFileName().toString();
        String fullPath = Paths.get(uploadDir, filename).toString();

        try {
            OcrResultDto ocr = ocrService.analyzeReceiptFromFile(fullPath);

            // Receipt DTO 생성
            ReceiptDto receiptDto = ReceiptDto.builder()
                    .shop(ocr.getShopName())
                    .imagePath(ocr.getImagePath())
                    .userId(userId)
                    .date(ocr.getDate())
                    .keywordId(keywordId)
                    .totalPrice((long) ocr.getTotalPrice())
                    .build();

            // 상세 항목 리스트 변환
            List<ReceiptItemEntity> items = ReceiptItemMapper.toEntityList(ocr.getItems());

            // 저장
            receiptService.saveReceiptWithItems(receiptDto, items);

            return ResponseEntity.ok().build();

        } catch (IOException e) {
            log.error("OCR 분석 및 저장 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/ocr/save/v2")
    public ResponseEntity<Void> saveFromClient(@RequestBody SaveReceiptRequest req) {
        //  프론트에서 수정한 데이터 그대로 사용
        ReceiptDto receiptDto = ReceiptDto.builder()
                .shop(req.getShopName())
                .imagePath(req.getPath())
                .userId(req.getUserId())
                .keywordId(req.getKeywordId())
                .date(req.getDate())
                .totalPrice((long) req.getTotalPrice())
                .build();

        //  항목들도 함께 저장
        List<ReceiptItemEntity> items = ReceiptItemMapper.toEntityList(req.getItems());
        receiptService.saveReceiptWithItems(receiptDto, items);

        return ResponseEntity.ok().build();
    }

}
