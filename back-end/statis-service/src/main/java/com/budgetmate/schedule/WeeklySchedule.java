package com.budgetmate.schedule;


import com.budgetmate.badgeTypeEnum.BadgeType;
import com.budgetmate.dto.UserDto;
import com.budgetmate.query.StatisQuery;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;



@Component
public class WeeklySchedule {
	
	private final StatisQuery statisQuery; 
	private BadgeType badgeType;
	
	public WeeklySchedule(StatisQuery statisQuery) {
		
		this.statisQuery = statisQuery;

	}
	
	@Transactional
	@Scheduled(cron = "0 32 12 ? * WED")
	public void WeeklyScheduleUpdate() { // CRON의 표현식 : 초 분 시 일 월 요일
		

		System.out.println("2 : updatePoint 실행 시작");
		List<UserDto> users = statisQuery.getUserList(); // 유저 목록 조회.
		
		for (UserDto user : users) {

			int currentWeek = statisQuery.getCurrentWeek(user.getId()).intValue(); // 이번주 소비 계산

			if (currentWeek < user.getLastWeek()) { //만약 조건 충족

				int point = user.getPoint() + 1;
				user.setPoint(point);

				if (point >= 10) {

				if(point == 10) {  // 절약 초보 뱃지

					badgeType = BadgeType.Beginner;

					if (!statisQuery.searchBadgeHistory(user.getId(), badgeType.getId())) {

						statisQuery.updateHistory(user.getId(),badgeType.getId());
						
					}
					
				} else if (point == 30) {
					badgeType = BadgeType.INTERMEDIATE;
					if (!statisQuery.searchBadgeHistory(user.getId(), badgeType.getId())) {

						statisQuery.updateHistory(user.getId(), badgeType.getId());

					}
					
				} else if (point == 50) {
					badgeType = BadgeType.MASTER;
					if (!statisQuery.searchBadgeHistory(user.getId(), badgeType.getId())) {

						statisQuery.updateHistory(user.getId(), badgeType.getId());
					}

					}
				}
				
			}

			statisQuery.updateUser(currentWeek, user.getPoint(),  user.getId());

		}
		
				
	}


}
