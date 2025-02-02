package com.smhrd.smone.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.smone.model.DiagnosisResult;
import com.smhrd.smone.repository.DiagnosisResultRepository;

@RestController
@RequestMapping("/api/diagnosis-result")
public class DiagnosisResultController {

	private final DiagnosisResultRepository diagRepo;
	
	public DiagnosisResultController(DiagnosisResultRepository diagRepo) {
		this.diagRepo = diagRepo;
	}
	
	@PostMapping
	public ResponseEntity<?> createDiagnosis(@RequestBody DiagnosisResult newResult){
		try {
			DiagnosisResult saved = diagRepo.save(newResult);
			return ResponseEntity.ok(saved);
		}catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("진단 결과 저장 중 오류가 발생했습니다.");
		}
	}
}
