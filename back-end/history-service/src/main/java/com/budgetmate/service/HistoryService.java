package com.budgetmate.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.budgetmate.dto.HistoryDto;
import com.budgetmate.query.HistoryQuery;

@Service
public class HistoryService {
	
	private final HistoryQuery historyQuery;
	
	public HistoryService (HistoryQuery historyQuery) {
		this.historyQuery = historyQuery;
	}
	
	public List<HistoryDto> getHistoryDate(Long userId) {

		return historyQuery.getHistoryDate(userId);
		
	}

}
