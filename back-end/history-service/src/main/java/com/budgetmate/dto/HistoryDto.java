package com.budgetmate.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HistoryDto {
	
	private Long badgeId;
	private LocalDate grantedDate;

}
