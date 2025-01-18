package com.smhrd.smone.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smhrd.smone.model.Patients;
import com.smhrd.smone.service.PatientsService;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientsController {

	@Autowired
	private PatientsService patientsService;

	// 환자 등록
	@PostMapping("/register")
	public ResponseEntity<?> registerPatient(@RequestBody Patients patient) {
		try {
			System.out.println("받은 데이터: " + patient.toString()); // 받은 데이터를 출력
			patientsService.registerPatient(patient); // 저장 로직 호출
			return ResponseEntity.ok("환자 등록 성공");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("환자 등록 중 오류가 발생했습니다.");
		}
	}

	// 전체 환자 목록 조회
    @GetMapping
    public ResponseEntity<List<Patients>> getAllPatients() {
        List<Patients> patients = patientsService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

 // 검색 및 페이지네이션
    @GetMapping("/search")
    public ResponseEntity<Page<Patients>> searchPatients(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String birth,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "5") int size
    ) {
        Page<Patients> patients = patientsService.searchPatients(name, birth, PageRequest.of(page, size));
        if (patients.isEmpty()) {
            return ResponseEntity.noContent().build(); // 검색 결과 없음
        }
        return ResponseEntity.ok(patients);
    }
}