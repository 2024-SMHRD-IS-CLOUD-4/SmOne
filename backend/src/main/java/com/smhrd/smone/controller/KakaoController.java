package com.smhrd.smone.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
@RequestMapping("/api/kakao")
public class KakaoController {

    private final WebClient webClient;

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    public KakaoController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://dapi.kakao.com").build();
    }

    // 키워드로 장소 검색
    @GetMapping("/search")
    public ResponseEntity<?> searchPlace(@RequestParam String keyword) {
        try {
            String response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/v2/local/search/keyword.json")
                    .queryParam("query", keyword)
                    .build())
                .header("Authorization", "KakaoAK " + kakaoApiKey)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            return ResponseEntity.ok(response); // React로 검색 결과 반환
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("카카오 API 호출 중 문제가 발생했습니다.");
        }
    }
}
