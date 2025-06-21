package com.budgetmate.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.budgetmate.dto.HistoryDto;
import com.budgetmate.security.TokenParser;
import com.budgetmate.service.HistoryService;

@RestController
@RequestMapping("/history")
public class HistoryController {
	
	private final HistoryService historyService;
	private final TokenParser tokenParser;
	
	public HistoryController(HistoryService historyService, TokenParser tokenParser) {

		this.historyService = historyService;
		this.tokenParser  = tokenParser;
	}
	
	@PostMapping("/getGrantedDate")
	public ResponseEntity<List<HistoryDto>> getHistoryDate(@RequestHeader("Authorization") String authHeader) {

		String token = authHeader.replace("Bearer ", "").trim();
		Long userId = tokenParser.getUserIdFromToken(token);
		return ResponseEntity.ok(historyService.getHistoryDate(userId));
	}

}
