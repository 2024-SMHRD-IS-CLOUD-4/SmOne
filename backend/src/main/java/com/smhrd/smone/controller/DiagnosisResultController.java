package com.smhrd.smone.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
	public ResponseEntity<?> createDiagnosis(@RequestBody DiagnosisResult newResult) {

		System.out.println("받은 진단 결과 -> " + newResult);
		try {
			DiagnosisResult saved = diagRepo.save(newResult);
			return ResponseEntity.ok(saved);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("진단 결과 저장 중 오류가 발생했습니다.");
		}
	}

	// [추가] 과거 진단 결과 조회
    //   => /api/diagnosis-result/byDate?pIdx=64&date=2025-02-03
    //   => DiagnosisResult + (XrayImages의 UploadedAt으로 날짜 필터)
    @GetMapping("/byDate")
    public ResponseEntity<?> getDiagnosisByDate(
            @RequestParam("pIdx") Integer pIdx,
            @RequestParam("date") String dateStr
    ) {
        try {
            // Repositoy의 Query 메서드 호출
            List<DiagnosisResult> list = diagRepo.findDiagnosisByDate(pIdx, dateStr);
            return ResponseEntity.ok(list);
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("과거 진단 조회 중 오류: " + e.getMessage());
        }
    }
}