package com.budgetmate.user.repository;

import com.budgetmate.user.entity.SignupCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SignupCodeRepository extends JpaRepository<SignupCode, Long> {
    // 사용되지 않은 상태(used=false)의 인증 코드 조회
    Optional<SignupCode> findByEmailAndUsedFalse(String email);

    Optional<SignupCode> findByEmailAndUsedTrue(String email);

    // 특정 이메일로 발급된 모든 레코드 삭제
    void deleteByEmail(String email);
}
