package com.smhrd.smone.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.smone.model.Patients;
import com.smhrd.smone.repository.PatientsRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PatientsService {

	@Autowired
	private PatientsRepository patientsRepository;

	// 환자 등록
	public Patients savePatient(Patients patient) {
		System.out.println("저장할 환자 데이터: " + patient);
		return patientsRepository.save(patient);
	}

	// 생년월일 앞부분으로 환자 검색
	public List<Patients> findPatientByPartialBirth(String birth) {
		return patientsRepository.findByBirthStartingWith(birth);
	}
}