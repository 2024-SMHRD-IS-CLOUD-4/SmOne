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
            return ResponseEntity.badRequest().body(e.getMessage());
            }
	}
	
	// 진단하기 => 파일 업로드 => DB insert(RESULT=null)
	@PostMapping("/diagnose")
    public ResponseEntity<?> diagnoseXray(@RequestParam("pIdx") Integer pIdx,
    									@RequestParam("files") List<MultipartFile> files) {
        try {
            List<XrayImages> saved = xrayService.insertXrayImages(pIdx, files);
            return ResponseEntity.ok(saved);
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업로드 실패: " + e.getMessage());
        }
    }
	
	// 특정 환자의 연-월-일 목록 (중복 없이, 최신순)
	@GetMapping("/dates")
	public ResponseEntity<?> getDistinctDates(@RequestParam Integer pIdx){
		try {
			List<String> dates = xrayService.getDistinctDates(pIdx);
			return ResponseEntity.ok(dates);
		}catch(Exception e){
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
	
	// 특정 환자 + 특정 연- 월 -일 => 해당 날짜 x-ray 목록
	@GetMapping("/byDate")
    public ResponseEntity<?> getImagesByDate(@RequestParam Integer pIdx,
                                             @RequestParam String date) {
        try {
            List<XrayImages> list = xrayService.getImagesByDate(pIdx, date);
            return ResponseEntity.ok(list);
        } catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}