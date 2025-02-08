package com.smhrd.smone.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;

import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;

@Service
public class KakaoService {

    private final WebClient webClient;

    @Value("${kakao.api.key}")
    private String kakaoApiKey;
    

    public KakaoService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://dapi.kakao.com").build();
    }

    // 장소 검색 API 호출 로직
    public Map<String, Object> searchPlace(String keyword) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/v2/local/search/keyword.json")
                .queryParam("query", keyword)
                .build())
            .header("Authorization", "KakaoAK " + kakaoApiKey)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .block();
    }
}