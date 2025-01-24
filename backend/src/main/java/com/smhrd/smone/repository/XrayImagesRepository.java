package com.smhrd.smone.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.XrayImages;

@Repository
public interface XrayImagesRepository extends JpaRepository<XrayImages, Integer> {
    // 특정 환자의 X-ray 목록
    List<XrayImages> findBypIdx(Integer pIdx);
    
    // 연 - 월 - 일 추출하여 중복 없이, 최신순
    // mysql -> DATE_FORMAT(UPLOADED_AT,'%Y-%m-%d')로 묶고, 내림차순 정렬
    @Query(value = 
    		"SELECT DATE_FORMAT(UPLOADED_AT, '%Y-%m-%d') AS diagDate " +
    		"FROM XRAY_IMAGES " +
    		"WHERE P_IDX = :pIdx " +
    		"GROUP BY diagDate " +
    		"ORDER BY diagDate DESC",
    		nativeQuery = true)
    List<String> findDistinctDatesByPIdx(@Param("pIdx") Integer pIdx);
    
    // 특정 환자 + 특정 연-월-일 => 해당 날짜 이미지들 (내림차순)
    @Query(value = 
    		"SELECT * FROM XRAY_IMAGES " +
    		"WHERE P_IDX = :pIdx " +
    		"AND DATE_FORMAT(UPLOADED_AT, '%Y-%m-%d') = :dateStr " +
    		"ORDER BY UPLOADED_AT DESC",
    		nativeQuery = true)
    List<XrayImages> findByPIdxAndDate(@Param("pIdx") Integer pIdx,
    									@Param("dateStr") String dateStr);
}
