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
	public void registerPatient(Patients patient) {
		patientsRepository.save(patient);
	}

	// 전체 환자 목록 조회
    public List<Patients> getAllPatients() {
        return patientsRepository.findAll();
    }

    // 이름 또는 주민등록번호 앞자리로 검색
    public List<Patients> searchPatients(String search) {
        return patientsRepository.findBypNameContainingOrBirthStartingWith(search, search);
    }
}