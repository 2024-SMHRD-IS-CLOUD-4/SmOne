package com.smhrd.smone.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
	public ResponseEntity<String> signup(@RequestBody User user){
		
		int result = service.signup(user);
		
		if(result >0) {
			return ResponseEntity.ok("회원가입 성공");
			
		}else {
			return ResponseEntity.badRequest().body("회원가입 실패");
		}
	}
	
	// 로그인
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody User user){
		
		User authenticateUser = service.login(user);
		
		if (authenticateUser != null) {
			return ResponseEntity.ok("로그인 성공");
		}else {
			return ResponseEntity.badRequest().body("로그인 실패");
		}
	}
	
}
