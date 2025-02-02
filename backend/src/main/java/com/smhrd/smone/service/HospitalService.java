package com.smhrd.smone.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.smone.model.HospitalInfo;
import com.smhrd.smone.repository.HospitalInfoRepository;
@Service
public class HospitalService {
	
	@Autowired
	private HospitalInfoRepository hospitalRepo;
	
	// 하버사인 공식...
    private double calcDistance(double lat1, double lng1, Double lat2, Double lng2){
        if(lat2 == null || lng2 == null) return Double.MAX_VALUE;
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2)
                 + Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng/2)*Math.sin(dLng/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R*c;
    }

    // 기존: 모든 병원 중 거리순
    public List<HospitalInfo> findNearestHospitals(double pLat, double pLng){
        List<HospitalInfo> all = hospitalRepo.findAll();
        all.sort((h1, h2) -> {
            double d1 = calcDistance(pLat, pLng, h1.getLat(), h1.getLng());
            double d2 = calcDistance(pLat, pLng, h2.getLat(), h2.getLng());
            return Double.compare(d1, d2);
        });
        return all;
    }

    // **새로 추가** : 특정 specialization만 필터 → 거리순
    public List<HospitalInfo> findNearestHospitalsWithDisease(double pLat, double pLng, String disease){
        // DB에서 specialization=해당 질환인 병원만 조회 (간단히 findAll() 후 필터링해도 OK)
        // 만약 JPA로 findBySpecialization(String disease) 메서드를 만들어도 됨
        List<HospitalInfo> diseaseList = hospitalRepo.findAll()
                                                     .stream()
                                                     .filter(h -> h.getSpecialization() != null 
                                                               && h.getSpecialization().contains(disease))
                                                     .toList();

        // 거리순 정렬
        diseaseList.sort((h1, h2) -> {
            double d1 = calcDistance(pLat, pLng, h1.getLat(), h1.getLng());
            double d2 = calcDistance(pLat, pLng, h2.getLat(), h2.getLng());
            return Double.compare(d1, d2);
        });
        return diseaseList;
    }
}