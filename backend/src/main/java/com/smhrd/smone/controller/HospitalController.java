package com.smhrd.smone.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
	
	// GET /api/hospitals?region=광주&disease=결핵
	// => 광주 + 결핵 병원
	@GetMapping
	public List<HospitalInfo> getHospitlas(@RequestParam String region, @RequestParam String disease){
		return hospitalRepo.findByRegionAndSpecialization(region, disease);
	}
	
	// 가까운 병원 찾기 5개까지
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
}