package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class VerifyCodeResponse {
    private boolean verified;
    private String message;
}
