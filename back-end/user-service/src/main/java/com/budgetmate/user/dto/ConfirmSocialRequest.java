package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmSocialRequest {
    private String email;
    private String loginType; // "KAKAO" or "GOOGLE"
}
