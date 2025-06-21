package com.budgetmate.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "history")
public class HistoryEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "History_id")
	Long HistoryId;
	
	@Column(name = "badge_id")
	Long badgeId;
	
	@Column(name = "user_id")
	Long userId;
	
	@Column(name = "week_start_date")
	LocalDate weekStartDate;
	
	@Column(name = "granted_date")
	LocalDate grantedDate;
	
	public HistoryEntity() { }

}
