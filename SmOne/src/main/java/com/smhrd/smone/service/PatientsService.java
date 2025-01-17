package com.smhrd.smone.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

 // 검색 및 페이지네이션
    public Page<Patients> searchPatients(String name, String birth, PageRequest pageRequest) {
        if (name != null && birth != null) {
            return patientsRepository.findBypNameContainingAndBirthStartingWith(name, birth, pageRequest);
        } else if (name != null) {
            return patientsRepository.findBypNameContaining(name, pageRequest);
        } else if (birth != null) {
            return patientsRepository.findByBirthStartingWith(birth, pageRequest);
        }
        return patientsRepository.findAll(pageRequest);
    }

    }
