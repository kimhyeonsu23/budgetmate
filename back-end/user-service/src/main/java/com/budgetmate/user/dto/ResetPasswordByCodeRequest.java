package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordByCodeRequest {
    private String email;      // 코드를 받은 이메일
    private String code;       // 인증 코드
    private String newPassword; // 사용자가 새로 설정할 비밀번호
}
