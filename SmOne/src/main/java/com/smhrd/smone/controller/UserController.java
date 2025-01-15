package com.smhrd.smone.controller;

import com.smhrd.smone.model.User;
import com.smhrd.smone.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 회원가입 API
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // 전달된 데이터 로그 출력
        System.out.println("Received User Data: " + user);

        // 필수 필드 검증
        if (user.getCenterId() == null || user.getCenterId().isEmpty()) {
            return ResponseEntity.badRequest().body("기관명을 입력하세요.");
        }
        if (user.getUAdd() == null || user.getUAdd().isEmpty()) {
            return ResponseEntity.badRequest().body("주소를 입력하세요.");
        }
        if (userService.isUserIdDuplicate(user.getUserId())) {
            return ResponseEntity.badRequest().body("중복된 아이디 입니다.");
        }

        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            // 예외 로그 출력
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("회원가입 중 오류가 발생했습니다.");
        }
    }

    // 아이디 중복 체크 API
    @GetMapping("/check-duplicate/{userId}")
    public ResponseEntity<?> checkUserIdDuplicate(@PathVariable String userId) {
        boolean isDuplicate = userService.isUserIdDuplicate(userId);
        return ResponseEntity.ok(isDuplicate);
    }
    
    // 로그인 API
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest){
    	User user = userService.findUserById(loginRequest.getUserId());
    	if(user == null || !user.getUserPw().equals(loginRequest.getUserPw())) {
    		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 일치하지 않습니다.");
    	}
    	return ResponseEntity.ok("로그인 성공");
    }
}
