package com.smhrd.smone.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.smhrd.smone.model.Patients;
import com.smhrd.smone.repository.PatientsRepository;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PatientsService {

    @Autowired
    private PatientsRepository patientsRepository;

    // [A] 환자 등록
    //     => Controller에서 centerId 세팅 후 Patients에 넣어준 뒤 저장
    public void registerPatient(Patients patient) {
        patientsRepository.save(patient);
    }

    // [B] 특정 센터의 환자 목록 조회
    public List<Patients> getPatientsByCenter(String centerId) {
        return patientsRepository.findByCenterId(centerId);
    }

    // [C] 특정 센터에서 검색 + 페이지네이션
    public Page<Patients> searchPatients(String centerId, String name, String birth, PageRequest pageRequest) {
        if (name != null && birth != null) {
            return patientsRepository.findByCenterIdAndPNameContainingAndBirthStartingWith(centerId, name, birth, pageRequest);
        } else if (name != null) {
            return patientsRepository.findByCenterIdAndPNameContaining(centerId, name, pageRequest);
        } else if (birth != null) {
            return patientsRepository.findByCenterIdAndBirthStartingWith(centerId, birth, pageRequest);
        }
        // 이름/생년월일 모두 없으면 센터 내 전체 목록(페이징)
        return patientsRepository.findByCenterId(centerId, pageRequest);
    }

    // [D] 환자 정보 수정
    //     => 수정 시 "해당 환자가 로그인 사용자 센터 소속인지" 확인 필요
    public void updatePatientWithoutGeocoding(String centerId, Integer pIdx, Patients newData) {
        Patients existing = patientsRepository.findById(pIdx.longValue())
            .orElseThrow(() -> new NoSuchElementException("해당 환자를 찾을 수 없습니다."));

        // 다른 센터 소속인 경우
        if (!existing.getCenterId().equals(centerId)) {
            throw new SecurityException("해당 환자는 다른 센터 소속입니다.");
        }

        // 필드 갱신
        existing.setPName(newData.getPName());
        existing.setGender(newData.getGender());
        existing.setBirth(newData.getBirth());
        existing.setTel(newData.getTel());
        existing.setPAdd(newData.getPAdd());
        existing.setPLat(newData.getPLat());
        existing.setPLng(newData.getPLng());

        patientsRepository.save(existing);
    }

    // [E] 환자 삭제
    public void deletePatient(String centerId, Integer pIdx) {
        Patients existing = patientsRepository.findById(pIdx.longValue())
            .orElseThrow(() -> new NoSuchElementException("해당 환자를 찾을 수 없습니다."));

        if (!existing.getCenterId().equals(centerId)) {
            throw new SecurityException("해당 환자는 다른 센터 소속입니다.");
        }
        patientsRepository.delete(existing);
    }
}
