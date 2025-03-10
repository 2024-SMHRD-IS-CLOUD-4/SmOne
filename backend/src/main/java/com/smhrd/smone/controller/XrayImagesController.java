package com.smhrd.smone.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.smone.model.XrayImages;
import com.smhrd.smone.service.NaverS3Service;
import com.smhrd.smone.service.XrayImagesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/xray")
@RequiredArgsConstructor
public class XrayImagesController {
	
	@Autowired
	private XrayImagesService xrayService;
	
	private final NaverS3Service naverS3Service;
	
	// 특정 환자 x-ray 목록 조회
	@GetMapping("/{pIdx}")
    public ResponseEntity<?> getXraysByPatient(@PathVariable Integer pIdx) {
        try {
            List<XrayImages> list = xrayService.getXraysByPatient(pIdx);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
          }
	}
	
	// 특정 환자의 X-ray 이미지 URL 리스트 반환
	@GetMapping("/images/{pIdx}")
	public ResponseEntity<List<String>> getXrayImages(@PathVariable Integer pIdx){
		List<XrayImages> images = xrayService.getXraysByPatient(pIdx);
		
		List<String> imgUrls = images.stream()
				.map(XrayImages::getImgPath)
				.collect(Collectors.toList());
		
		return ResponseEntity.ok(imgUrls);
	}

	@PostMapping("/diagnose")
	public ResponseEntity<?> diagnoseXray(
	    @RequestParam("pIdx") Integer pIdx,
	    @RequestParam("files") List<MultipartFile> files,
	    @RequestParam(value="bigFilename", required=false) String bigFilename
	) {
	    try {
	        List<XrayImages> saved = xrayService.insertXrayImages(pIdx, files, bigFilename);
	        return ResponseEntity.ok(saved);
	    } catch(Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                             .body("업로드 실패: " + e.getMessage());
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
	
	// X-ray 결과 업데이트 => RESULT, PROCESSED_AT
	@PutMapping("/updateResult")
    public ResponseEntity<?> updateXrayResult(@RequestBody XrayImages req) {
        try {
            // req.imgIdx, req.result 필요
            xrayService.updateXrayResult(req.getImgIdx(), req.getResult());
            return ResponseEntity.ok("X-ray result updated");
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("업데이트 실패: " + e.getMessage());
        }
	}
}