package com.smhrd.smone.repository;


import com.smhrd.smone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUserId(String userId); // USER_ID 중복 체크 메서드
}
