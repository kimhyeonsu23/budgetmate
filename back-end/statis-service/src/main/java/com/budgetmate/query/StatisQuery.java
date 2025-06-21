package com.budgetmate.query;

import com.budgetmate.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.*;
import java.time.temporal.*;
import java.util.*;

@Repository
@RequiredArgsConstructor
public class StatisQuery {

	private final JdbcTemplate jdbcTemplate;

	//  이번 주 총 소비
	public Long getCurrentWeek(Long userId) {
		LocalDate today = LocalDate.now();
		LocalDate monday = today.with(DayOfWeek.MONDAY);

		String sql = "SELECT SUM(total_price) FROM receipt WHERE user_id = ? AND keyword_id != ? AND is_deleted = 0 AND `date` BETWEEN ? AND ?";
		Long totalPrice = jdbcTemplate.queryForObject(sql, Long.class, userId, 8, Date.valueOf(monday), Date.valueOf(today));
		return totalPrice != null ? totalPrice : 0L;
	}

	//이번 주 카테고리별 소비 금액
	public Map<String, Integer> getKeywordTotalPriceCurrentWeek(Long userId) {
		LocalDate today = LocalDate.now();
		LocalDate monday = today.with(DayOfWeek.MONDAY);
		return getCategoryStats(userId, monday, today);
	}

	//  이번 달 소비 총합
	public int getMonthlyTotalCurrent(Long userId) {
		LocalDate now = LocalDate.now();
		LocalDate start = now.withDayOfMonth(1);
		LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

		String sql = "SELECT SUM(total_price) FROM receipt WHERE user_id = ? AND keyword_id != ? AND is_deleted = 0 AND `date` BETWEEN ? AND ?";
		Integer total = jdbcTemplate.queryForObject(sql, Integer.class, userId, 8, Date.valueOf(start), Date.valueOf(end));
		return total != null ? total : 0;
	}

	//  이번 달 카테고리별 통계
	public Map<String, Integer> getKeywordTotalPriceCurrent(Long userId) {
		LocalDate now = LocalDate.now();
		LocalDate start = now.withDayOfMonth(1);
		LocalDate end = now.withDayOfMonth(now.lengthOfMonth());
		return getCategoryStats(userId, start, end);
	}


	//  연/월 기준 소비 총합
	public int getMonthlyTotal(Long userId, int year, int month) {
		LocalDate start = LocalDate.of(year, month, 1);
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

		String sql = "SELECT SUM(total_price) FROM receipt WHERE user_id = ? AND keyword_id != ? AND is_deleted = 0 AND `date` BETWEEN ? AND ?";
		Integer total = jdbcTemplate.queryForObject(sql, Integer.class, userId, 8, Date.valueOf(start), Date.valueOf(end));
		return total != null ? total : 0;
	}

	//  연/월 기준 카테고리별 통계
	public Map<String, Integer> getKeywordTotalPrice(Long userId, int year, int month) {
		LocalDate start = LocalDate.of(year, month, 1);
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		return getCategoryStats(userId, start, end);
	}

	//  연/월 예산
	public int getMonthlyBudget(Long userId, int year, int month) {
		try {
			String sql = "SELECT budget FROM monthly_budget WHERE user_id = ? AND year = ? AND month = ?";
			return jdbcTemplate.queryForObject(sql, Integer.class, userId, year, month);
		} catch (org.springframework.dao.EmptyResultDataAccessException e) {
			return 0;
		}
	}

	//  공통 카테고리 통계 계산기
	private Map<String, Integer> getCategoryStats(Long userId, LocalDate start, LocalDate end) {
		Map<String, Integer> result = new HashMap<>();
		String[] categoryNames = { "외식", "교통비", "생활비", "쇼핑", "건강", "교육", "저축/투자" };
		String sql = "SELECT SUM(total_price) FROM receipt WHERE user_id = ? AND keyword_id = ? AND is_deleted = 0 AND `date` BETWEEN ? AND ?";

		for (int i = 0; i < categoryNames.length; i++) {
			Integer sum = jdbcTemplate.queryForObject(sql, Integer.class, userId, i + 1, Date.valueOf(start), Date.valueOf(end));
			result.put(categoryNames[i], sum != null ? sum : 0);
		}

		return result;
	}

	// 유저 전체 조회
	public List<UserDto> getUserList() {
		String sql = "SELECT * FROM user";
		return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(UserDto.class));
	}

	// ✔ 포인트 및 주차 업데이트
	public void updateUser(int lastWeek, int point, Long userId) {
		jdbcTemplate.update("UPDATE user SET point = ?, last_week = ? WHERE id = ?", point, lastWeek, userId);
	}

	//  뱃지 이력 확인
	public boolean searchBadgeHistory(Long userId, Long badgeId) {
		String sql = "SELECT 1 FROM history WHERE user_id = ? AND badge_id = ? LIMIT 1";
		return !jdbcTemplate.queryForList(sql, userId, badgeId).isEmpty();
	}

	//  뱃지 이력 추가
	public void updateHistory(Long userId, Long badgeId) {
		LocalDate today = LocalDate.now();
		LocalDate monday = today.with(DayOfWeek.MONDAY);
		String sql = "INSERT INTO history (badge_id, user_id, week_start_date, granted_date) VALUES (?, ?, ?, ?)";
		jdbcTemplate.update(sql, badgeId, userId, monday, today);
	}


}
