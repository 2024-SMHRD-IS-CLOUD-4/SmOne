package com.smhrd.smone.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.smone.service.NaverS3Service;

import java.io.IOException;

@RestController
@RequestMapping("/api/xray")
public class XrayUploadController {
    private final NaverS3Service s3Service;

    public XrayUploadController(NaverS3Service s3Service) {
        this.s3Service = s3Service;
    }

    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            return s3Service.uploadFile(file);
        } catch (IOException e) {
            return "파일 업로드 실패: " + e.getMessage();
        }
    }
}