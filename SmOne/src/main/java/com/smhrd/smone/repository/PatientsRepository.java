package com.smhrd.smone.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smhrd.smone.model.Patients;

public interface PatientsRepository extends JpaRepository<Patients, Integer> {
	
	 // 생년월일 앞부분으로 검색
    @Query("SELECT p FROM Patients p WHERE p.birth LIKE :birth%")
    List<Patients> findByBirthStartingWith(@Param("birth") String birth);
}