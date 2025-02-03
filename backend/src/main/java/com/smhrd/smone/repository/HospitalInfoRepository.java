package com.smhrd.smone.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.HospitalInfo;

@Repository
public interface HospitalInfoRepository extends JpaRepository<HospitalInfo, Integer> {

	List<HospitalInfo> findByRegionAndSpecialization(String region, String specialization);
}
