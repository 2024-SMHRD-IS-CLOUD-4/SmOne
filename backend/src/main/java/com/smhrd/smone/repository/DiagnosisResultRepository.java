package com.smhrd.smone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.DiagnosisResult;

@Repository
public interface DiagnosisResultRepository extends JpaRepository<DiagnosisResult, Integer> {

}
