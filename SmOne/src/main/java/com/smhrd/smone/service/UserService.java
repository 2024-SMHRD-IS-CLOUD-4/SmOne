package com.smhrd.smone.service;

import com.smhrd.smone.model.User;
import com.smhrd.smone.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 회원가입
    public User registerUser(User user) {
        return userRepository.save(user);
    }

    // 아이디 중복 체크
    public boolean isUserIdDuplicate(String userId) {
        return userRepository.existsByUserId(userId);
    }
    
    //
    public User findUserById(String userId) {
    	return userRepository.findByUserId(userId);
    }
}
