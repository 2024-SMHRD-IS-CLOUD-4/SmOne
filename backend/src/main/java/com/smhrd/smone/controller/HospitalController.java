package com.smhrd.smone.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smhrd.smone.model.HospitalInfo;
import com.smhrd.smone.repository.HospitalInfoRepository;
import com.smhrd.smone.service.HospitalService;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalInfoRepository hospitalRepo;
    private final HospitalService hospitalService;

    public HospitalController(HospitalInfoRepository hospitalRepo, HospitalService hospitalService) {
        this.hospitalRepo = hospitalRepo;
        this.hospitalService = hospitalService;
    }

    // 예: GET /api/hospitals?region=광주&disease=결핵
    @GetMapping
    public List<HospitalInfo> getHospitals(@RequestParam String region, @RequestParam String disease){
        return hospitalRepo.findByRegionAndSpecialization(region, disease);
    }

    // [A] 가까운 병원 n개
    // GET /api/hospitals/near?lat=35.19&lng=126.83&limit=5
    @GetMapping("/near")
    public List<HospitalInfo> getNearestHospitals(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue="5") int limit
    ){
        List<HospitalInfo> sorted = hospitalService.findNearestHospitals(lat, lng);
        if(sorted.size() > limit){
            return sorted.subList(0, limit);
        } else {
            return sorted;
        }
    }

    // [B] 가까운 병원 (특정 disease만)
    // GET /api/hospitals/near/disease?lat=...&lng=...&disease=결핵&limit=5
    @GetMapping("/near/disease")
    public List<HospitalInfo> getNearestHospitalsByDisease(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam String disease,
        @RequestParam(defaultValue="5") int limit
    ){
        List<HospitalInfo> sorted = hospitalService.findNearestHospitalsWithDisease(lat, lng, disease);
        return (sorted.size() > limit)? sorted.subList(0, limit) : sorted;
    }
 // [추가] 병원 단건 조회 (리액트에서 /api/hospitals/{hosIdx} 호출 시 사용)
    @GetMapping("/{hosIdx}")
    public ResponseEntity<?> getHospitalById(@PathVariable Integer hosIdx) {
        Optional<HospitalInfo> found = hospitalRepo.findById(hosIdx);
        if(found.isPresent()) {
            return ResponseEntity.ok(found.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
