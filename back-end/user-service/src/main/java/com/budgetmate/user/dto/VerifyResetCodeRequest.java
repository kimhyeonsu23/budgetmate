package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyResetCodeRequest {
    private String email;  // 코드가 발송된 이메일
    private String code;   // 사용자가 입력한 6자리 인증 코드
}
