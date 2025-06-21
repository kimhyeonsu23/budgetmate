package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FindIdResponse {
    // 단일 계정이 조회되었을 때
    private String email;

    // 중복된 이름으로 2개 이상 조회되었을 때
    private boolean multiple;       // true면 emailList 필드를 참고
    private List<String> emailList;
}
