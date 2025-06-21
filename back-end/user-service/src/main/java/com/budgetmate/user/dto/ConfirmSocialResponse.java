package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmSocialResponse {
    private String accessToken;
    private String email;
    private String userName;
    private String error;
}
