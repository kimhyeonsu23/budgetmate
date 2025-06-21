package com.budgetmate.user.dto;

import com.budgetmate.user.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupResponse {
    private boolean success;
    private String message;
    private User user;
    private String token;
}
