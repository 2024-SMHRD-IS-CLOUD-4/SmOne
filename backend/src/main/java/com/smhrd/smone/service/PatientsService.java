package com.smhrd.smone.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.smone.model.Patients;
import com.smhrd.smone.repository.PatientsRepository;

import java.util.List;
import java.util.NoSuchElementException;
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
    
    // 환자 정보 수정
    public Patients updatePatient(Integer pIdx, Patients newData) {
        Patients existing = patientsRepository.findById(pIdx.longValue())
            .orElseThrow(() -> new NoSuchElementException("해당 환자를 찾을 수 없습니다."));

        // 필요한 필드를 갱신
        existing.setPName(newData.getPName());
        existing.setGender(newData.getGender());
        existing.setBirth(newData.getBirth());
        existing.setTel(newData.getTel());
        existing.setPAdd(newData.getPAdd());

        return patientsRepository.save(existing);
    }

    // 환자 정보 삭제
    public void deletePatient(Integer pIdx) {
    	// DB에서 해당 환자 조회
        Patients existing = patientsRepository.findById(pIdx.longValue())
            .orElseThrow(() -> new NoSuchElementException("해당 환자를 찾을 수 없습니다."));
        
        // 삭제
        patientsRepository.delete(existing);
    }

    }
