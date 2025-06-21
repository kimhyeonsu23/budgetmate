package com.budgetmate.badgeTypeEnum;

public enum BadgeType { // enum은 new 로 생성하는것이 아니라 jvm이 클래스를 로딩할 때 미리 모든 enum 객체를 자동으로 생성해서 메모리에 올려둠.
// enum은 이미 선언 시점에 3개의 객체를 자동으로 만들어졌음. jvm이 자동으로 만들어놓은 싱글턴객체가 됨.
	
	Beginner(1L, 10), // BadgeType.BEGINNER는 문자열이 안리ㅏ BadgeType의 객체 중 하나. 
	INTERMEDIATE(2L, 30), // 각각의 객체
	MASTER(3L, 50); // 각각의 객체
	
	private final Long badgeId;
	private final int requiredPoint;
	
	BadgeType(Long badgeId, int requiredPoint) {
		this.badgeId = badgeId;
		this.requiredPoint = requiredPoint;
	}

	public Long getId() {
		return badgeId;
	}
	
	public int getRequeiredPoint() {

		return requiredPoint;
	}
	
}
