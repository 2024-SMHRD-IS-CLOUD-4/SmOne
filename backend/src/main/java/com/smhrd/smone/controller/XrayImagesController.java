package com.smhrd.smone.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.smone.model.XrayImages;
import com.smhrd.smone.service.XrayImagesService;

@RestController
@RequestMapping("/api/xray")
public class XrayImagesController {
	
	@Autowired
	private XrayImagesService xrayService;
	
	// 환자별 x-ray 목록 조회
	@GetMapping("/{pIdx}")
    public ResponseEntity<?> getXraysByPatient(@PathVariable Integer pIdx) {
        try {
            List<XrayImages> list = xrayService.getXraysByPatient(pIdx);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
	
	// 진단하기 => 파일 업로드 => DB insert(RESULT=null)
	@PostMapping("/diagnose")
    public ResponseEntity<?> diagnoseXray(
        @RequestParam("pIdx") Integer pIdx,
        @RequestParam("files") MultipartFile[] files
    ) {
        try {
            List<XrayImages> saved = xrayService.insertXrayImages(pIdx, files);
            return ResponseEntity.ok(saved);
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업로드 실패: " + e.getMessage());
        }
    }
}