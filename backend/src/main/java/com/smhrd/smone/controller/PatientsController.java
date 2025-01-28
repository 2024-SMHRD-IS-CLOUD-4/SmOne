package com.smhrd.smone.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smhrd.smone.model.Patients;
import com.smhrd.smone.repository.PatientsRepository;
import com.smhrd.smone.service.PatientsService;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

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
    
    // 환자 정보 수정
    @PutMapping("/update/{pIdx}")
    public ResponseEntity<?> updatePatient(
    		@PathVariable("pIdx") Integer pIdx,
    		@RequestBody Patients newData
    ) {
    	try {
    		Patients updated = patientsService.updatePatient(pIdx, newData);
    		return ResponseEntity.ok(updated); // 수정된 환자 정보 반환
    	} catch (NoSuchElementException e) {
    		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("환자를 찾을 수 없습니다.");
    	} catch (Exception e) {
    		e.printStackTrace();
    		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("환자 정보 수정 중 오류가 발생했습니다.");
    	}
    }
    
    // 환자 정보 삭제
    @DeleteMapping("/{pIdx}")
    public ResponseEntity<?> deletePatient(@PathVariable("pIdx") Integer pIdx){
    	try {
    		patientsService.deletePatient(pIdx);
    		return ResponseEntity.ok("환자 삭제 성공");
    	} catch (NoSuchElementException e) {
    		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("환자 삭제 중 오류가 발생했습니다.");
    	}
    }
    
}