package com.budgetmate.receipt.service;

import com.budgetmate.receipt.dto.OcrResultDto;
import com.budgetmate.receipt.dto.ReceiptItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class OcrService {

    private final RestTemplate restTemplate;

    @Value("${naver.ocr.invoke-url}")
    private String invokeUrl;
    @Value("${naver.ocr.secret-key}")
    private String secretKey;
    @Value("${naver.ocr.access-key}")
    private String accessKey;

    public OcrResultDto analyzeReceiptFromFile(String filePath) throws IOException {
        byte[] bytes = Files.readAllBytes(Paths.get(filePath));
        String base64Image = Base64.getEncoder().encodeToString(bytes);

        Map<String, Object> imageMap = Map.of(
                "format", "jpg",
                "name", "receipt",
                "data", base64Image
        );
        Map<String, Object> requestBody = Map.of(
                "images", List.of(imageMap),
                "requestId", UUID.randomUUID().toString(),
                "version", "V2",
                "timestamp", System.currentTimeMillis()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-OCR-SECRET", secretKey);
        headers.set("Authorization", accessKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(invokeUrl, request, Map.class);
        log.info("OCR 응답 전체: {}", response);

        @SuppressWarnings("unchecked")
        Map<String, Object> imageResult = (Map<String, Object>) ((List<?>) response.get("images")).get(0);
        @SuppressWarnings("unchecked")
        Map<String, Object> receipt = (Map<String, Object>) imageResult.get("receipt");
        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) receipt.get("result");

        String shopName = Optional.ofNullable(result)
                .map(r -> (Map<String, Object>) r.get("storeInfo"))
                .map(s -> (Map<String, Object>) s.get("name"))
                .map(n -> (Map<String, Object>) n.get("formatted"))
                .map(f -> (String) f.get("value"))
                .orElse("상호명 없음");

        LocalDate date = Optional.ofNullable(result)
                .map(r -> (Map<String, Object>) r.get("paymentInfo"))
                .map(p -> (Map<String, Object>) p.get("date"))
                .map(d -> (Map<String, Object>) d.get("formatted"))
                .map(f -> {
                    try {
                        return LocalDate.of(
                                Integer.parseInt((String) f.get("year")),
                                Integer.parseInt((String) f.get("month")),
                                Integer.parseInt((String) f.get("day"))
                        );
                    } catch (Exception ex) {
                        return LocalDate.now();
                    }
                }).orElse(LocalDate.now());

        int totalPrice = Optional.ofNullable(result)
                .map(r -> (Map<String, Object>) r.get("totalPrice"))
                .map(p -> (Map<String, Object>) p.get("price"))
                .map(f -> (Map<String, Object>) f.get("formatted"))
                .map(m -> {
                    try {
                        return Integer.parseInt(((String) m.get("value")).replaceAll("\\D", ""));
                    } catch (Exception ex) {
                        return 0;
                    }
                }).orElse(0);

        List<ReceiptItemDto> itemDtos = new ArrayList<>();
        try {
            List<Map<String, Object>> subResults = (List<Map<String, Object>>) result.get("subResults");
            for (Map<String, Object> subResult : subResults) {
                List<Map<String, Object>> items = (List<Map<String, Object>>) subResult.get("items");
                for (Map<String, Object> item : items) {
                    try {
                        String name = Optional.ofNullable((Map<String, Object>) item.get("name"))
                                .map(m -> (String) m.get("text"))
                                .orElse("상품명 없음");

                        //  unitPrice 추출
                        Map<String, Object> priceMap = (Map<String, Object>) item.get("price");
                        Object unitPriceObj = null;
                        if (priceMap != null && priceMap.get("unitPrice") != null) {
                            unitPriceObj = priceMap.get("unitPrice");
                        } else if (item.get("unitPrice") != null) {
                            unitPriceObj = item.get("unitPrice");
                        }

                        log.debug(" unitPrice 전체 구조: {}", unitPriceObj);

                        int unitPrice = 0;
                        try {
                            if (unitPriceObj instanceof Map unitPriceMap) {
                                Map<String, Object> formatted = (Map<String, Object>) unitPriceMap.get("formatted");
                                if (formatted != null && formatted.get("value") != null) {
                                    String raw = formatted.get("value").toString();
                                    unitPrice = Integer.parseInt(raw.replaceAll("\\D", ""));
                                    log.info(" unitPrice(formatted) 파싱됨: {}", raw);
                                } else if (unitPriceMap.get("value") != null) {
                                    String raw = unitPriceMap.get("value").toString();
                                    unitPrice = Integer.parseInt(raw.replaceAll("\\D", ""));
                                    log.info(" unitPrice(value) 파싱됨: {}", raw);
                                } else if (unitPriceMap.get("text") != null) {
                                    String raw = unitPriceMap.get("text").toString();
                                    unitPrice = Integer.parseInt(raw.replaceAll("\\D", ""));
                                    log.info(" unitPrice(text) 파싱됨: {}", raw);
                                } else {
                                    log.warn(" unitPrice 내부 필드를 찾을 수 없음: {}", unitPriceMap);
                                }
                            } else {
                                log.warn(" unitPrice 필드가 Map이 아님: {}", unitPriceObj);
                            }
                        } catch (Exception e) {
                            log.warn(" unitPrice 파싱 중 오류: {}", e.getMessage());
                        }

                        int quantity = Optional.ofNullable((Map<String, Object>) item.get("count"))
                                .map(m -> (String) m.get("text"))
                                .map(t -> t.replaceAll("\\D", ""))
                                .map(s -> s.isEmpty() ? "1" : s)
                                .map(Integer::parseInt)
                                .orElse(1);

                        int price = Optional.ofNullable((Map<String, Object>) item.get("price"))
                                .map(m -> (Map<String, Object>) m.get("price"))
                                .map(p -> (String) p.get("text"))
                                .map(t -> t.replaceAll("\\D", ""))
                                .map(s -> s.isEmpty() ? "0" : s)
                                .map(Integer::parseInt)
                                .orElse(unitPrice * quantity);

                        log.info(" item 파싱: name={}, unitPrice={}, quantity={}, totalPrice={}",
                                name, unitPrice, quantity, price);

                        itemDtos.add(ReceiptItemDto.builder()
                                .itemName(name)
                                .unitPrice(unitPrice)
                                .quantity(quantity)
                                .totalPrice(price)
                                .build());

                    } catch (Exception e) {
                        log.warn(" 개별 항목 파싱 실패: {}", e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn(" 항목 전체 파싱 실패: {}", e.getMessage());
        }

        String filename = Paths.get(filePath).getFileName().toString();
        OcrResultDto dto = new OcrResultDto(shopName, date, totalPrice, filename);
        dto.setItems(itemDtos);
        return dto;
    }
}
