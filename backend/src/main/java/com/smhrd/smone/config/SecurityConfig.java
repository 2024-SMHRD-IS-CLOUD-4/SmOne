package com.smhrd.smone.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/SmOne/api/xray/upload").permitAll()  // ✅ 파일 업로드 API 접근 허용
                .anyRequest().permitAll()  // ✅ 모든 요청을 인증 없이 허용
            )
            .csrf(csrf -> csrf.disable())  // ✅ CSRF 보호 비활성화 (파일 업로드 방해 방지)
            .headers(headers -> headers.frameOptions().disable()) // ✅ 프레임 옵션 비활성화 (추가적인 보안 설정)
            .formLogin(login -> login.disable())  // ✅ 로그인 페이지 비활성화
            .httpBasic(httpBasic -> httpBasic.disable());  // ✅ 기본 인증 비활성화 (Unauthorized 방지)

        return http.build();
    }
}