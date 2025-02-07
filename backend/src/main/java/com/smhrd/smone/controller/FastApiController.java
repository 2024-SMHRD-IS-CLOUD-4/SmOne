package com.smhrd.smone.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import com.smhrd.smone.repository.DiagnosisResultRepository;
import com.smhrd.smone.service.UserService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/fastapi")
public class FastApiController {

    private final String FASTAPI_URL = "http://223.130.157.164:8000/diagnose";  // FastAPI 서버 주소
    private final RestTemplate restTemplate = new RestTemplate(); // HTTP 요청용
    private final DiagnosisResultRepository diagRepo;  // DB 저장을 위한 Repository
    private final UserService userService;  // 사용자 정보 조회 서비스

    public FastApiController(DiagnosisResultRepository diagRepo, UserService userService) {
        this.diagRepo = diagRepo;
        this.userService = userService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendToFastApi(@RequestBody Map<String, Object> requestData, HttpSession session) {
        try {
            // ✅ 세션에서 userId 가져오기
            String userId = (String) session.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("세션이 만료되었습니다. 다시 로그인해주세요.");
            }

            // ✅ userId를 기반으로 doctor_id 조회 (userId 자체가 doctorId)
            String doctorId = userService.getDoctorIdByUserId(userId);  // 기존 userId 그대로 사용
            if (doctorId == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("의사 정보를 찾을 수 없습니다.");
            }

            // ✅ FastAPI로 보낼 데이터에 doctor_id 추가
            requestData.put("doctor_id", doctorId);

            // ✅ FastAPI로 데이터 전송
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestData, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(FASTAPI_URL, requestEntity, Map.class);

            return ResponseEntity.ok(response.getBody()); // FastAPI 응답 반환
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("FastAPI 연결 실패: " + e.getMessage());
        }
    }
}
