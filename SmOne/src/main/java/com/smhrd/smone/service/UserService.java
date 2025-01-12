package com.smhrd.smone.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.smone.mapper.UserMapper;
import com.smhrd.smone.model.User;

@Service
public class UserService {

    @Autowired
    private UserMapper mapper;

    public int signup(User user) {
        // 중복된 아이디 확인
        User existingUser = mapper.findByUserId(user.getUserId());
        if (existingUser != null) {
            return 0; // 중복된 아이디
        }
        return mapper.signup(user);
    }

    public User login(User user) {
        return mapper.login(user);
    }

    public boolean isUsernameAvailable(String userId) {
        User existingUser = mapper.findByUserId(userId);
        return existingUser == null;
    }
}
