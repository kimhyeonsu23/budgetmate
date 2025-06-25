package com.budgetmate.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MyInfoResponse {
    private Long id;
    private String email;
    private String userName;
    private List<String> roles;
    private Integer point;

}
