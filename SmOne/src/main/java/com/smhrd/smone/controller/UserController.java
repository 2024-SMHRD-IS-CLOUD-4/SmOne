package com.smhrd.smone.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.smone.model.User;
import com.smhrd.smone.service.UserService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService service;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        int result = service.signup(user);
        if (result > 0) {
            return ResponseEntity.ok("회원가입 성공");
        } else {
            return ResponseEntity.badRequest().body("회원가입 실패: 이미 존재하는 아이디입니다.");
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        User authenticatedUser = service.login(user);
        if (authenticatedUser != null) {
            return ResponseEntity.ok("로그인 성공");
        } else {
            return ResponseEntity.badRequest().body("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
        }
    }

    // 아이디 중복 확인
    @GetMapping("/check-username/{userId}")
    public ResponseEntity<String> checkUsername(@PathVariable String userId) {
        boolean isAvailable = service.isUsernameAvailable(userId);
        if (isAvailable) {
            return ResponseEntity.ok("사용 가능한 아이디입니다.");
        } else {
            return ResponseEntity.badRequest().body("이미 존재하는 아이디입니다.");
        }
    }
}
