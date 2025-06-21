package com.budgetmate.user.repository;

import com.budgetmate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findBySocialIdAndLoginType(String socialId, com.budgetmate.user.entity.LoginType loginType);

    // 이름(userName)으로 조회 시, 여러 건 반환
    List<User> findAllByUserName(String userName);
}
