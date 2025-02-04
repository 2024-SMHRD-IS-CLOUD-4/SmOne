package com.smhrd.smone.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.Patients;

@Repository
public interface PatientsRepository extends JpaRepository<Patients, Long> {
	
	// 1) 특정 센터의 전체 환자 목록
    List<Patients> findByCenterId(String centerId);

    // 2) 특정 센터의 검색 + 페이징
    Page<Patients> findByCenterIdAndPNameContainingAndBirthStartingWith(String centerId, String name, String birth, Pageable pageable);
    Page<Patients> findByCenterIdAndPNameContaining(String centerId, String name, Pageable pageable);
    Page<Patients> findByCenterIdAndBirthStartingWith(String centerId, String birth, Pageable pageable);
    
    Page<Patients> findByCenterId(String centerId, Pageable pageable);
}