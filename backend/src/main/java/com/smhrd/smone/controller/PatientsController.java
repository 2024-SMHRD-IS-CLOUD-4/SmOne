package com.smhrd.smone.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smhrd.smone.model.Patients;
import com.smhrd.smone.service.KakaoGeocodeService;
import com.smhrd.smone.service.PatientsService;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/patients")
public class PatientsController {

    @Autowired
    private PatientsService patientsService;

    @Autowired
    private KakaoGeocodeService geoService;

 // 환자 등록
    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(@RequestBody Patients patient) {
        try {
            System.out.println("받은 데이터(등록): " + patient.toString());

            // (1) 주소 전처리 + 지오코딩
            String fullAddr = patient.getPAdd();
            if (fullAddr != null && !fullAddr.isBlank()) {
                String baseAddr = refineAddress(fullAddr);
                if (baseAddr != null && !baseAddr.isBlank()) {
                    Double[] latlng = geoService.getLatLngFromAddress(baseAddr);
                    if (latlng != null) {
                        patient.setPLat(latlng[0]);
                        patient.setPLng(latlng[1]);
                    }
                }
            }

            // (2) DB 저장
            patientsService.registerPatient(patient);

            // (3) 문자 응답
            return ResponseEntity.ok("환자 등록이 완료되었습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("환자 등록 중 오류가 발생했습니다.");
        }
    }

    // 환자 정보 수정
    @PutMapping("/update/{pIdx}")
    public ResponseEntity<?> updatePatient(@PathVariable("pIdx") Integer pIdx,
                                           @RequestBody Patients newData) {
        try {
            System.out.println("받은 데이터(수정): " + newData.toString());

            // (1) 주소 전처리 + 지오코딩
            String fullAddr = newData.getPAdd();
            if (fullAddr != null && !fullAddr.isBlank()) {
                String baseAddr = refineAddress(fullAddr);
                if (baseAddr != null && !baseAddr.isBlank()) {
                    Double[] latlng = geoService.getLatLngFromAddress(baseAddr);
                    if (latlng != null) {
                        newData.setPLat(latlng[0]);
                        newData.setPLng(latlng[1]);
                    }
                }
            }

            // (2) DB 업데이트
            patientsService.updatePatient(pIdx, newData);

            // (3) 문자 응답
            return ResponseEntity.ok("환자 정보가 수정되었습니다.");

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("환자를 찾을 수 없습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("환자 정보 수정 중 오류가 발생했습니다.");
        }
    }

    // [3] 전체 환자 목록
    @GetMapping
    public ResponseEntity<List<Patients>> getAllPatients() {
        List<Patients> patients = patientsService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    // [4] 검색 + 페이지네이션
    @GetMapping("/search")
    public ResponseEntity<?> searchPatients(@RequestParam(required = false) String name,
                                            @RequestParam(required = false) String birth,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "5") int size) {
        Page<Patients> patients = patientsService.searchPatients(name, birth, PageRequest.of(page, size));
        if (patients.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(patients);
    }

    // [5] 환자 삭제
    @DeleteMapping("/{pIdx}")
    public ResponseEntity<?> deletePatient(@PathVariable("pIdx") Integer pIdx) {
        try {
            patientsService.deletePatient(pIdx);
            return ResponseEntity.ok("환자 삭제 성공");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("환자 삭제 중 오류가 발생했습니다.");
        }
    }

    // [주소 전처리 메서드]
    private String refineAddress(String full) {
        if (full == null) return null;

        // 괄호(...) 제거
        String noParen = full.replaceAll("\\(.*?\\)", "").trim();

        // 일부 줄임말을 풀어서 변경
        String replaced = noParen
            .replace("전남 ", "전라남도 ")
            .replace("전북 ", "전라북도 ")
            .replace("경남 ", "경상남도 ")
            .replace("경북 ", "경상북도 ")
            .replace("충남 ", "충청남도 ")
            .replace("충북 ", "충청북도 ")
            .replace("강원 ", "강원도 ")
            .replace("제주 ", "제주특별자치도 ");

        // 3층, 12호 등 제거
        replaced = replaced.replaceAll("\\d+층", "");
        replaced = replaced.replaceAll("\\d+호", "");

        // 맨 앞 우편번호 5자리 제거
        replaced = replaced.replaceAll("^(\\d{5})\\s*", "");

        return replaced.trim();
    }
}
