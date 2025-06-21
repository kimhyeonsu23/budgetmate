package com.budgetmate.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {
	
	private Long Id;
	private int point;
	private int lastWeek;
	private int currentWeek;
	
	public void addPoint() {
		System.out.println("7 : addPoint");
		point++;
	}
	

}
