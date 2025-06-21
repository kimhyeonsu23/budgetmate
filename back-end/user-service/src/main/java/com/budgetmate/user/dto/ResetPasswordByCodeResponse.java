package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordByCodeResponse {
    private boolean success;
    private String message;
}
