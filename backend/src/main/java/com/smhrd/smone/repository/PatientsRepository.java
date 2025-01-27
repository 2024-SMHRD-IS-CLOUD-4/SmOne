package com.smhrd.smone.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.Patients;

@Repository
public interface PatientsRepository extends JpaRepository<Patients, Long> {
	
	// 이름과 주민등록번호를 모두 만족하는 경우
    Page<Patients> findBypNameContainingAndBirthStartingWith(String name, String birth, PageRequest pageRequest);

    // 이름으로만 검색
    Page<Patients> findBypNameContaining(String name, PageRequest pageRequest);

    // 주민등록번호로만 검색
    Page<Patients> findByBirthStartingWith(String birth, PageRequest pageRequest);

	}