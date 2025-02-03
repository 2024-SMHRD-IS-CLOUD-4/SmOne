package com.smhrd.smone.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.DiagnosisResult;

@Repository
public interface DiagnosisResultRepository extends JpaRepository<DiagnosisResult, Integer> {

	// [추가] 특정 환자 + 날짜 => 진단 결과 목록
    //       XRAY_IMAGES와 JOIN, UPLOADED_AT이 dateStr와 같은 레코드
    @Query(value = """
        SELECT dr.*
          FROM DIAGNOSIS_RESULT dr
          JOIN XRAY_IMAGES xi ON dr.IMG_IDX = xi.IMG_IDX
         WHERE dr.P_IDX = :pIdx
           AND DATE_FORMAT(xi.UPLOADED_AT, '%Y-%m-%d') = :dateStr
         ORDER BY dr.RESULT_IDX DESC
        """, nativeQuery = true)
    List<DiagnosisResult> findDiagnosisByDate(
        @Param("pIdx") Integer pIdx,
        @Param("dateStr") String dateStr
    );

}