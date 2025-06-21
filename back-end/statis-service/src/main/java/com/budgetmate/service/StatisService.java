package com.budgetmate.service;

import java.util.Map;

import com.budgetmate.dto.CategoryRecommendationDto;
import com.budgetmate.dto.MonthlyStatsDto;
import com.budgetmate.query.StatisQuery;
import org.springframework.stereotype.Service;

@Service
public class StatisService {

	private final StatisQuery statisQuery;


	public StatisService(StatisQuery statisQuery) {
		this.statisQuery = statisQuery;
	}

	//  이번 주 총 소비
	public Long getCurrentWeekService(Long userId) {
		System.out.println("StatisService - getCurrentWeekService 실행 / 유저아이디 : " + userId);
		return statisQuery.getCurrentWeek(userId);
	}

    // 이번 주 카테고리별 통계
	public Map<String, Integer> getCurrentWeekCategoryStats(Long userId) {
		return statisQuery.getKeywordTotalPriceCurrentWeek(userId);
	}
	//  이번 달 총 지출
	public int getCurrentMonthTotal(Long userId) {
		System.out.println("StatisService - getCurrentMonthTotal 실행 / 유저 아이디 : " + userId);
		return statisQuery.getMonthlyTotalCurrent(userId);
	}

	//  이번 달 카테고리별 통계
	public Map<String, Integer> getCurrentMonthCategoryStats(Long userId) {
		System.out.println("StatisService - getCurrentMonthCategoryStats 실행 / 유저 아이디 : " + userId);
		return statisQuery.getKeywordTotalPriceCurrent(userId);
	}


	//  과소비 카테고리 추천
	public CategoryRecommendationDto recommendCategory(Long userId) {
		Map<String, Integer> map = statisQuery.getKeywordTotalPriceCurrent(userId);

		if (map.isEmpty()) {
			return new CategoryRecommendationDto("없음", "소비 내역이 없습니다.");
		}

		String overspent = map.entrySet().stream()
				.max(Map.Entry.comparingByValue())
				.get()
				.getKey();

		String reason = String.format(
				"%s 카테고리에 지출이 많아요. 꼭 필요한 지출이 아니라면 줄여보는 건 어떨까요?",
				overspent
		);

		return new CategoryRecommendationDto(overspent, reason);
	}

	//  연/월 기준 통합 통계
	public MonthlyStatsDto getMonthlyStats(Long userId, int year, int month) {
		System.out.println("StatisService - getMonthlyStats 실행 / userId: " + userId + " / " + year + "-" + month);

		int totalSpending = statisQuery.getMonthlyTotal(userId, year, month);
		Map<String, Integer> categoryStats = statisQuery.getKeywordTotalPrice(userId, year, month);
		int budget = statisQuery.getMonthlyBudget(userId, year, month);

		return new MonthlyStatsDto(totalSpending, categoryStats, budget);
	}
}
