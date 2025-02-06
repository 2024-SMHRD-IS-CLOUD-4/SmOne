package com.smhrd.smone.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class NaverCloudConfig {
    
    @Value("${cloud.naver.access-key}")
    private String accessKey;

    @Value("${cloud.naver.secret-key}")
    private String secretKey;

    @Value("${cloud.naver.endpoint}")
    private String endpoint;

    @Value("${cloud.naver.region}")
    private String region;

    @Value("${cloud.naver.bucket-name}")
    private String bucketName;

    public String getAccessKey() { return accessKey; }
    public String getSecretKey() { return secretKey; }
    public String getEndpoint() { return endpoint; }
    public String getRegion() { return region; }
    public String getBucketName() { return bucketName; }
}
