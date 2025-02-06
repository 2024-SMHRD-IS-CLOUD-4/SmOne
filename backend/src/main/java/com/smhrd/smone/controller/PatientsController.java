package com.smhrd.smone.controller;

import com.smhrd.smone.model.Patients;
import com.smhrd.smone.model.User;
import com.smhrd.smone.service.KakaoGeocodeService;
import com.smhrd.smone.service.PatientsService;
import com.smhrd.smone.service.UserService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/patients")
public class PatientsController {

    @Autowired
    private PatientsService patientsService;

    @Autowired
    private KakaoGeocodeService geoService;

    @Autowired
    private UserService userService; // 로그인 사용자 정보 조회용

    // [1] 환자 등록
    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(@RequestBody Patients patient, HttpSession session) {
        try {
            // (A) 로그인 사용자 체크
            String userId = (String) session.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
            }
            User user = userService.findUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 사용자입니다.");
            }

            System.out.println("받은 데이터(등록): " + patient);

            // (B) 주소 전처리 + 지오코딩
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

            // (C) 본인 센터 ID 세팅
            String centerId = user.getCenterId();
            patient.setCenterId(centerId);

            // (D) DB 저장
            patientsService.registerPatient(patient);

            return ResponseEntity.ok("환자 등록이 완료되었습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("환자 등록 중 오류가 발생했습니다.");
        }
    }

    // [2] 환자 수정
    @PutMapping("/update/{pIdx}")
    public ResponseEntity<?> updatePatient(@PathVariable("pIdx") Integer pIdx,
                                           @RequestBody Patients newData,
                                           HttpSession session) {
        try {
            // (A) 로그인 사용자 확인
            String userId = (String) session.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
            }
            User user = userService.findUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 사용자입니다.");
            }

            System.out.println("받은 데이터(수정): " + newData);

            // (B) 주소 전처리 + 지오코딩
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

            // (C) 본인 센터 ID
            String centerId = user.getCenterId();

            // (D) 업데이트
            patientsService.updatePatient(centerId, pIdx, newData);

            return ResponseEntity.ok("환자 정보가 수정되었습니다.");

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("환자를 찾을 수 없습니다.");
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(se.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("환자 정보 수정 중 오류가 발생했습니다.");
        }
    }

    // [3] 특정 센터의 전체 환자 목록
    @GetMapping
    public ResponseEntity<?> getAllPatients(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User user = userService.findUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 사용자입니다.");
        }

        String centerId = user.getCenterId();
        List<Patients> patients = patientsService.getPatientsByCenter(centerId);

        // ✅ P_IDX 값이 정상적으로 포함되는지 확인
        System.out.println("환자 리스트: " + patients);
        
        return ResponseEntity.ok(patients);
    }

    // [4] 검색 + 페이지네이션
    @GetMapping("/search")
    public ResponseEntity<?> searchPatients(
            HttpSession session,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String birth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User user = userService.findUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 사용자입니다.");
        }

        String centerId = user.getCenterId();
        Page<Patients> patients = patientsService.searchPatients(centerId, name, birth, PageRequest.of(page, size));

        if (patients.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(patients);
    }

    // [5] 환자 삭제
    @DeleteMapping("/{pIdx}")
    public ResponseEntity<?> deletePatient(@PathVariable("pIdx") Integer pIdx,
                                           HttpSession session) {
        try {
            String userId = (String) session.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
            }
            User user = userService.findUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 사용자입니다.");
            }

            String centerId = user.getCenterId();

            patientsService.deletePatient(centerId, pIdx);
            return ResponseEntity.ok("환자 삭제 성공");

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("해당 환자를 찾을 수 없습니다.");
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(se.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("환자 삭제 중 오류가 발생했습니다.");
        }
    }

    // 주소 전처리
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

