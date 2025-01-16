package com.smhrd.smone.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.Patients;

@Repository
public interface PatientsRepository extends JpaRepository<Patients, Long> {
	
	// 이름에 포함되거나 주민등록번호 앞 6자리로 검색
	List<Patients> findBypNameContainingOrBirthStartingWith(String pName, String birth);
	}