package com.budgetmate.controller;

import com.budgetmate.dto.CategoryRecommendationDto;
import com.budgetmate.dto.MonthlyStatsDto;
import com.budgetmate.security.TokenParser;
import com.budgetmate.service.StatisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/statis")
public class StatisController {

	private final TokenParser tokenParser;
	private final StatisService statisService;

	public StatisController(TokenParser tokenParser, StatisService statisService) {
		this.tokenParser = tokenParser;
		this.statisService = statisService;
	}

	//  이번 주 총 소비 금액
	@GetMapping("/getReceipt/calCurrentWeek")
	public ResponseEntity<Long> getCurrentWeek(@RequestHeader("Authorization") String authHeader) {
		Long userId = tokenParser.getUserIdFromToken(authHeader.replace("Bearer ", "").trim());
		return ResponseEntity.ok(statisService.getCurrentWeekService(userId));
	}

	// 이번 주 카테고리별 총합
	@GetMapping("/getReceipt/calKeywordTotalPriceWeekly")
	public ResponseEntity<Map<String, Integer>> getKeywordTotalPriceWeekly(@RequestHeader("Authorization") String authHeader) {
		Long userId = tokenParser.getUserIdFromToken(authHeader.replace("Bearer ", "").trim());
		return ResponseEntity.ok(statisService.getCurrentWeekCategoryStats(userId));
	}

	// 이번 달 총 소비 금액
	@GetMapping("/getReceipt/calMonthlyTotal")
	public ResponseEntity<Integer> getMonthlyTotal(@RequestHeader("Authorization") String authHeader) {
		Long userId = tokenParser.getUserIdFromToken(authHeader.replace("Bearer ", "").trim());
		return ResponseEntity.ok(statisService.getCurrentMonthTotal(userId));  // 이름 수정
	}

	// 이번 달 카테고리별 총합
	@GetMapping("/getReceipt/calKeywordTotalPrice")
	public ResponseEntity<Map<String, Integer>> getKeywordTotalPrice(@RequestHeader("Authorization") String authHeader) {
		Long userId = tokenParser.getUserIdFromToken(authHeader.replace("Bearer ", "").trim());
		return ResponseEntity.ok(statisService.getCurrentMonthCategoryStats(userId));  // 이름 수정
	}


	//  카테고리 과소비 추천
	@GetMapping("/getReceipt/recommendCategory")
	public ResponseEntity<CategoryRecommendationDto> getRecommendCategory(@RequestHeader("Authorization") String authHeader) {
		Long userId = tokenParser.getUserIdFromToken(authHeader.replace("Bearer ", "").trim());
		return ResponseEntity.ok(statisService.recommendCategory(userId));
	}

	//  연/월 기반 통합 소비 통계 (총합 + 카테고리 + 예산)
	@GetMapping("/getReceipt/monthlyStats")
	public ResponseEntity<MonthlyStatsDto> getMonthlyStats(
			@RequestHeader("Authorization") String authHeader,
			@RequestParam("year") int year,
			@RequestParam("month") int month
	) {
		Long userId = tokenParser.getUserIdFromToken(authHeader.replace("Bearer ", "").trim());
		return ResponseEntity.ok(statisService.getMonthlyStats(userId, year, month));
	}
}
