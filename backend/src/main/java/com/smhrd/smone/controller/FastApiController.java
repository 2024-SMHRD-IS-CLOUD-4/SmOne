package com.smhrd.smone.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/fastapi")
public class FastApiController {

    private final String FASTAPI_URL = "http://223.130.157.164:8000/diagnose";  // FastAPI 서버 주소
    private final RestTemplate restTemplate = new RestTemplate(); // HTTP 요청용

    @PostMapping("/send")
    public ResponseEntity<String> sendToFastApi(@RequestBody Map<String, Object> requestData) {
        try {
            // FastAPI로 데이터 전송
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestData, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(FASTAPI_URL, requestEntity, String.class);

            return ResponseEntity.ok(response.getBody()); // FastAPI 응답 반환
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FastAPI 연결 실패: " + e.getMessage());
        }
    }
}
