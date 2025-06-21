package com.budgetmate.user.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String userName;

    @ElementCollection(fetch = FetchType.EAGER)
    @Builder.Default
    private List<String> roles = new ArrayList<>(List.of("ROLE_USER"));

//    @Column(name = "badge")
//    @Builder.Default
//    private int userBadge = 0; // 뱃지 상태를 처음에는 0으로 초기화.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoginType loginType = LoginType.LOCAL;

    private String socialId;

    private String resetCode;

    @Temporal(TemporalType.TIMESTAMP)
    private Date resetCodeExpireAt;

    @Builder.Default
    private int lastWeek = 0;
    @Builder.Default
    private int currentWeek = 0;
    @Builder.Default
    private int point = 0;

    @Column(updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // Spring Security UserDetails 구현
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(SimpleGrantedAuthority::new).toList();
    }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    @PrePersist // entitiy가 처음 저장되기 전(insert전에)자동 호출됨.
    protected void prePersist() {
        this.createdAt = new Date(); // 생성일 초기화.
        this.updatedAt = new Date(); // 수정일 초기화
        //this.userBadge = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }

    public String getUserName() {
        return this.userName;
    }
}
