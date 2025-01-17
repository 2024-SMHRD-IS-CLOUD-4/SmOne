package com.smhrd.smone.controller;

import com.smhrd.smone.model.User;
import com.smhrd.smone.model.VerificationRequest;
import com.smhrd.smone.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;
	private final Map<String, String> verificationCodeStorage = new ConcurrentHashMap<>();

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
		if (userService.isUserIdDuplicate(user.getUserId())) {
			return ResponseEntity.badRequest().body("중복된 아이디 입니다.");
		}

		try {
			User registeredUser = userService.registerUser(user);
			return ResponseEntity.ok(registeredUser);
		} catch (Exception e) {
			// 예외 로그 출력
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 오류가 발생했습니다.");
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
	public ResponseEntity<?> login(@RequestBody User loginRequest, HttpSession session) {
		User user = userService.findUserById(loginRequest.getUserId());
		if (user == null || !user.getUserPw().equals(loginRequest.getUserPw())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 일치하지 않습니다.");
		}
		
		// 세션에 사용자 정보를 저장
        session.setAttribute("userId", user.getUserId());
        
		return ResponseEntity.ok("로그인 성공");
	}
	
	// 세션 유지 확인
	@GetMapping("/session-check")
	public ResponseEntity<?> checkSession(HttpSession session){
		String userId = (String) session.getAttribute("userId");
		if(userId == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("세션이 만료 되었습니다.");
		}
		return ResponseEntity.ok("세션 유지중: " + userId);
	}
	
	// 로그아웃 API
	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletRequest requset){
		HttpSession session = requset.getSession(false); // 현재 세션 가져오기
		if(session != null) {
			session.invalidate(); // 세션 무효화
		}
		return ResponseEntity.ok("로그아웃 성공");
	}

	// 아이디 찾기API
	@PostMapping("/findid")
	public ResponseEntity<?> findUserId(@RequestBody User user) {

		System.out.println("아이디 찾기 요청 데이터:" + user);

		String foundUserId = userService.findUserId(user.getCenterId(), user.getUserName(), user.getRole(),
				user.getEmail());

		if (foundUserId != null) {
			return ResponseEntity.ok(foundUserId); // 아이디 반환
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("입력하신 정보와 일치하는 아이디가 없습니다.");
		}
	}

	// 비밀번호 찾기 - 인증번호 전송 API
	@PostMapping("/password/send-email")
	public ResponseEntity<?> sendVerificationEmail(@RequestBody User user) {
		try {
			// 인증번호 생성 및 이메일 전송
			String verificationCode = userService.sendVerificationEmail(user.getUserId(), user.getEmail());
			// 인증번호를 임시 저장소에 저장
			verificationCodeStorage.put(user.getUserId(), verificationCode);
			return ResponseEntity.ok("인증번호가 이메일로 전송되었습니다.");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이메일 전송 중 오류가 발생했습니다.");
		}
	}

	// 인증번호 검증 API
	@PostMapping("/password/verify-code")
	public ResponseEntity<?> verifyCode(@RequestBody VerificationRequest request) {
		String storedCode = verificationCodeStorage.get(request.getUserId());
		if (storedCode != null && storedCode.equals(request.getVerificationCode())) {
			return ResponseEntity.ok("인증번호가 일치합니다.");
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증번호가 일치하지 않습니다.");
	}

	// 비밀번호 변경 API
	@PostMapping("/password/change")
	public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
	    String userId = request.get("userId");
	    String newPassword = request.get("newPassword");

	    try {
	        boolean isUpdated = userService.changePassword(userId, newPassword);

	        if (isUpdated) {
	            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
	        } else {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("아이디를 찾을 수 없습니다.");
	        }
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("비밀번호 변경 중 오류가 발생했습니다.");
	    }
	}


}
