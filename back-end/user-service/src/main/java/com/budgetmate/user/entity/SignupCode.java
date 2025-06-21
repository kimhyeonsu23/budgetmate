package com.budgetmate.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;            // 가입하려는 이메일

    @Column(nullable = false)
    private String code;             // 6자리 인증 코드

    @Temporal(TemporalType.TIMESTAMP)
    private Date expireAt;           // 만료 시점

    @Column(nullable = false)
    private boolean used;            // 이미 사용했는지 여부 (true면 재사용 불가)
}
