package com.smhrd.smone.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class KakaoGeocodeService {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    private final WebClient webClient;

    public KakaoGeocodeService(WebClient.Builder builder){
        this.webClient = builder.baseUrl("https://dapi.kakao.com").build();
    }

    // 주소 -> (lat, lng) 변환
    public Double[] getLatLngFromAddress(String address){
        if(address == null || address.trim().isEmpty()){
            return null;
        }
        try {
            
            Map<String,Object> result = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/v2/local/search/address.json")
                    .queryParam("query", address)
                    .build())
                .header("Authorization", "KakaoAK " + kakaoApiKey)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String,Object>>() {})
                .block();

            if(result == null) return null;

            List<Map<String,Object>> docs = (List<Map<String,Object>>) result.get("documents");
            if(docs == null || docs.size() == 0) {
                return null;  // 검색 결과 없음
            } 
            
            // 첫 번째 결과
            Map<String,Object> first = docs.get(0);
            String x = (String) first.get("x"); // 경도
            String y = (String) first.get("y"); // 위도

            Double lng = Double.parseDouble(x);
            Double lat = Double.parseDouble(y);

            return new Double[]{lat, lng};
        } catch(Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}