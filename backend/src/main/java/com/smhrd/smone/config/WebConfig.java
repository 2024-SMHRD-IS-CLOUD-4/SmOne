package com.smhrd.smone.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
	
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 엔드포인트에 대해 CORS 허용
                .allowedOrigins("http://223.130.157.164" , "http://223.130.157.164:3000" , "http://localhost:3000","http://223.130.157.164:8000") // React 개발 서버 주소
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
        		.allowCredentials(true);
    }
    
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String imagePath = System.getProperty("user.home") + "/XrayImages/"; // 유저 홈 디렉토리에 저장
    registry.addResourceHandler("/images/**")
            .addResourceLocations("file:///" + imagePath);
}

}
