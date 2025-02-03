package com.smhrd.smone.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.smone.model.HospitalInfo;
import com.smhrd.smone.repository.HospitalInfoRepository;
@Service
public class HospitalService {
	
	@Autowired
	private HospitalInfoRepository hospitalRepo;
	
	// 하버사인 공식
    private double calcDistance(double lat1, double lng1, Double lat2, Double lng2){
        // 만약 병원 lat/lng가 null이면 무한대 처리
        if(lat2 == null || lng2 == null) {
            return Double.MAX_VALUE;
        }
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2)
                 + Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng/2)*Math.sin(dLng/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R*c;
    }

    // [A] 모든 병원 중 거리순
    public List<HospitalInfo> findNearestHospitals(double pLat, double pLng){
        List<HospitalInfo> all = hospitalRepo.findAll();
        // mutable list이므로 sort 가능
        all.sort((h1, h2) -> {
            double d1 = calcDistance(pLat, pLng, h1.getLat(), h1.getLng());
            double d2 = calcDistance(pLat, pLng, h2.getLat(), h2.getLng());
            return Double.compare(d1, d2);
        });
        return all;
    }

    // [B] 특정 질환(결핵/폐렴 등) 병원만 필터 → 거리순
    public List<HospitalInfo> findNearestHospitalsWithDisease(double pLat, double pLng, String disease){
        // 1) 전체 병원
        List<HospitalInfo> all = hospitalRepo.findAll();

        // 2) 스페셜라이제이션에 'disease'가 포함된 것만 필터
        //    stream().toList()가 아니라 Collectors.toList() 써서 mutable list로 받기
        List<HospitalInfo> diseaseList = all.stream()
            .filter(h -> h.getSpecialization() != null 
                      && h.getSpecialization().contains(disease))
            .collect(Collectors.toList()); // mutable list

        // 3) 거리순 정렬
        diseaseList.sort((h1, h2) -> {
            double d1 = calcDistance(pLat, pLng, h1.getLat(), h1.getLng());
            double d2 = calcDistance(pLat, pLng, h2.getLat(), h2.getLng());
            return Double.compare(d1, d2);
        });
        return diseaseList;
    }
}