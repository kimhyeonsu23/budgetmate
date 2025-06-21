package com.budgetmate.query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.budgetmate.dto.HistoryDto;


@Repository
public class HistoryQuery {
	
	private final JdbcTemplate jdbcTemplate;
	
	public HistoryQuery(JdbcTemplate jdbcTemplate) {
		
		this.jdbcTemplate = jdbcTemplate;
		
	}
	
	public List<HistoryDto> getHistoryDate(Long userId) {

		String sql = "SELECT badge_id, granted_date FROM history WHERE user_id = ?";
		List<HistoryDto> historyList = jdbcTemplate.query(sql, new BeanPropertyRowMapper<> (HistoryDto.class), userId);
		return historyList;
		
		
	}

}
