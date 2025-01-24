package com.smhrd.smone.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.XrayImages;

@Repository
public interface XrayImagesRepository extends JpaRepository<XrayImages, Integer> {
    // 특정 환자의 X-ray 목록
    List<XrayImages> findBypIdx(Integer pIdx);
}
