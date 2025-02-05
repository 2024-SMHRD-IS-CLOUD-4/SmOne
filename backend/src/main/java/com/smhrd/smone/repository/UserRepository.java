package com.smhrd.smone.repository;


import com.smhrd.smone.model.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
   
	boolean existsByUserId(String userId); // USER_ID 중복 체크 메서드
    User findByUserId(String userId); // ID로 사용자 조회
    
    // 아이디 찾기 쿼리 메소드
    Optional<User> findByCenterIdAndUserNameAndRoleAndEmail(String centerId, String userName, String role, String email);
}
