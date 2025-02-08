package com.smhrd.smone.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.smhrd.smone.config.NaverCloudConfig;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class NaverS3Service {
   private final AmazonS3 s3Client;
    private final String bucketName;

    public NaverS3Service(NaverCloudConfig naverCloudConfig) {
        this.bucketName = naverCloudConfig.getBucketName();

        this.s3Client = AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(
                        "https://kr.object.ncloudstorage.com",
                        "kr-standard"
                ))
                .withCredentials(new AWSStaticCredentialsProvider(
                        new BasicAWSCredentials(naverCloudConfig.getAccessKey(), naverCloudConfig.getSecretKey())))
                .build();
    }

    // 📌 이미지 업로드 기능
    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();

        // 파일 메타데이터 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        // S3에 파일 업로드
        s3Client.putObject(new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata)
                .withCannedAcl(CannedAccessControlList.PublicRead));

        // ✅ uploadFile 메서드 닫기
        return generateFileUrl(fileName);
    }
    private String generateFileUrl(String fileName) {
        // 파일의 공개 URL 생성
        return String.format("https://kr.object.ncloudstorage.com/%s/%s", bucketName, fileName);
    }
}