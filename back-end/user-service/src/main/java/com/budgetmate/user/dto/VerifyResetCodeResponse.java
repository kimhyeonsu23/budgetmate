package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyResetCodeResponse {
    private boolean verified;
    private String message;
}
