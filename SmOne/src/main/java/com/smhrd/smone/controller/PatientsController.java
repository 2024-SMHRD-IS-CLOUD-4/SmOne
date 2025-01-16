package com.smhrd.smone.controller;

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

    // 이름 또는 주민등록번호 앞자리로 검색
    @GetMapping("/{search}")
    public ResponseEntity<List<Patients>> searchPatients(@PathVariable String search) {
        List<Patients> patients = patientsService.searchPatients(search);
        if (patients.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(patients);
    }
}